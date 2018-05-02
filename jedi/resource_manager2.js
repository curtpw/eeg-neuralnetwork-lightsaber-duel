/*
 * ================================================================================================
 * -*- JavaScript -*-
 * File: resource_manager.js
 * Author: Guilherme R. Lampert
 * Created on: 2015-05-07
 * Brief: Simple manager and cache for resources like textures, 3D models, shaders and materials.
 *
 * License:
 *  This source code is released under the MIT License.
 *  Copyright (c) 2015 Guilherme R. Lampert.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *
 * ================================================================================================
 */

"use strict";
if (typeof jedi2 !== "object") {
	alert("Error: Import/load 'jedi2.js' first!");
	throw "Script load error";
}
var jedi2 = jedi2;




/*
===========================================================
jedi2.ResourceManager singleton class:
===========================================================
*/
jedi2.ResourceManager = (function () {

	/*
	 * Private data:
	 */
	var resMgrInitialized    = false; // Set once `init()` is called.
	var preloadCompleteCb    = null;  // Callback fired when all pending preload requests are finished.
	var inFlightLoadRequests = 0;     // Number of resources currently loading asynchronously.
	var loadedShaderProgs    = {};    // ShaderProgram cache. Successfully loaded programs only.
	var loaded3DModels       = {};    // Model3D cache. Successfully loaded textures only.
	var loadedTextures       = {};    // Texture cache. Successfully loaded models only.
	var loadedMaterials      = {};    // Material cache. Most materials are loaded from MTL files.

	/*
	 * Internal helpers:
	 */
	function fixMaterialReferences() {
		//
		// Materials will reference textures and shader programs,
		// however, when asynchronously loading, the data might not 
		// arrive in the correct order. This is admittedly a hack, but
		// we will store the resource names in some fields of `jedi2.Material`
		// when preloading them. Once the asynchronous downloads are finished,
		// we walk all the newly created materials and replace the string
		// references with the actual objects. Hey, what's the point of all
		// this lack of data types in JavaScript if you don't use it ;)
		//
		var key, mat, diffTexName, specTexName, normTexName, progName;
		for (key in loadedMaterials) {
			mat = loadedMaterials[key];
			if (!(mat instanceof jedi2.Material)) {
				continue;
			}

			diffTexName = mat.getDiffuseTexture();
			if (typeof diffTexName === "string") {
				mat.setDiffuseTexture(jedi2.ResourceManager.findTexture(diffTexName));
			}
			specTexName = mat.getSpecularTexture();
			if (typeof specTexName === "string") {
				mat.setSpecularTexture(jedi2.ResourceManager.findTexture(specTexName));
			}
			normTexName = mat.getNormalTexture();
			if (typeof normTexName === "string") {
				mat.setNormalTexture(jedi2.ResourceManager.findTexture(normTexName));
			}
			progName = mat.getShaderProgram();
			if (typeof progName === "string") {
				mat.setShaderProgram(jedi2.ResourceManager.findShaderProgram(progName));
			}
		}

		jedi2.logComment("ResourceManager: Fixed Material references.");
	}

	function fixModel3DReferences() {
		//
		// Same problem of loading order described above.
		// Though models only reference materials.
		//
		var key, mdl, materialName, meshCount;
		for (key in loaded3DModels) {
			mdl = loaded3DModels[key];
			if (!(mdl instanceof jedi2.Model3D)) {
				continue;
			}

			meshCount = mdl.getMeshCount();
			for (var m = 0; m < meshCount; ++m) {
				materialName = mdl.getMesh(m).material;
				if (typeof materialName === "string") {
					mdl.getMesh(m).material = jedi2.ResourceManager.findMaterial(materialName);
				}
			}
		}

		jedi2.logComment("ResourceManager: Fixed Model3D references.");
	}

	function checkPreloadCompletion() {
		if (inFlightLoadRequests == 0) {

			jedi2.logComment("---- Resource preload completed! ----");
			jedi2.logComment("ShaderPrograms..: " + loadedShaderProgs.itemCount);
			jedi2.logComment("Models..........: " + loaded3DModels.itemCount);
			jedi2.logComment("Textures........: " + loadedTextures.itemCount);
			jedi2.logComment("Materials.......: " + loadedMaterials.itemCount);
			jedi2.logComment("-------------------------------------");
			
			fixMaterialReferences();
			fixModel3DReferences();

			if (preloadCompleteCb) {
				preloadCompleteCb();
			}
		}
	}

	function downloadPreloadManifestFile(url, completionCallback) {
		jedi2.logComment("Trying to load preload manifest file '" + url + "' asynchronously...");
		var reqHandler = function () {
			if (this.status == 200 && this.responseText != null) {
				jedi2.logComment("Manifest file '" + url + "' loaded!");
				completionCallback(this.responseText);
			} else {
				// Something went wrong...
				jedi2.logWarning("Failed to load manifest file '" + url + "'. Status: " + this.status);
				completionCallback(null);
			}
		};
		var xmlHttpReq = new XMLHttpRequest();
		xmlHttpReq.onload = reqHandler;
		xmlHttpReq.open(/* method = */ "GET", /* path = */ url, /* async = */ true);
		xmlHttpReq.send();
	}

	function preloadAll(preloadManifestFileContents) {
		var preloadManifest = JSON.parse(preloadManifestFileContents);

		if (!preloadManifest) {
			jedi2.logError("Failed to parse JSON text from preload manifest file!");
			return false;
		}
		if (!preloadManifest.preload) {
			jedi2.logError("Missing 'preload' section in preload manifest file!");
			return false;
		}

		if (preloadManifest.preload.textures && (preloadManifest.preload.textures instanceof Array)) {
			jedi2.logComment("---- Preloading Textures ----");
			var textures = preloadManifest.preload.textures;
			for (var t = 0; t < textures.length; ++t) {
				var textureId = textures[t];
				if (loadedTextures.hasOwnProperty(textureId)) {
					continue; // Already loaded.	
				}

				jedi2.logComment("Preloading Texture '" + textureId + "'...");
				var isJPEG = (textureId.substring(textureId.lastIndexOf('.')).toLowerCase() === ".jpg");
				var texObj = new jedi2.Texture(textureId);

				inFlightLoadRequests++;
				texObj.initAsyncFromFile(textureId,
					function (newTexture, loadInfo) {
						if (newTexture) {
							loadedTextures[newTexture.getName()] = newTexture;
							loadedTextures.itemCount++;
							jedi2.logComment(loadInfo);
						} else {
							jedi2.logError(loadInfo);
						}
						inFlightLoadRequests--;
						checkPreloadCompletion();
					},
					/* flipV          = */ (isJPEG ? true : false),
					/* wantsMipmaps   = */ true,
					/* textureType    = */ jedi2.TextureType.TEXTURE_2D,
					/* addressingMode = */ jedi2.TextureAddressing.DEFAULT,
					/* filterType     = */ jedi2.TextureFilter.DEFAULT);
			}
		}

		if (preloadManifest.preload.programs && (preloadManifest.preload.programs instanceof Array)) {
			jedi2.logComment("---- Preloading Shader Programs ----");
			var programs = preloadManifest.preload.programs;
			for (var p = 0; p < programs.length; ++p) {
				var programId = programs[p][0];
				if (loadedShaderProgs.hasOwnProperty(programId)) {
					continue; // Already loaded.
				}

				jedi2.logComment("Preloading ShaderProgram '" + programId + "'...");
				var vsFileName = programs[p][1];
				var fsFileName = programs[p][2];
				var shaderProg = new jedi2.ShaderProgram(programId);

				inFlightLoadRequests++;
				shaderProg.initAsyncFromFile(vsFileName, fsFileName,
					function (newProgram, loadInfo) {
						if (newProgram) {
							loadedShaderProgs[newProgram.getName()] = newProgram;
							loadedShaderProgs.itemCount++;
							jedi2.logComment(loadInfo);
						} else {
							jedi2.logError(loadInfo);
						}
						inFlightLoadRequests--;
						checkPreloadCompletion();
					});
			}
		}

		if (preloadManifest.preload.materials && (preloadManifest.preload.materials instanceof Array)) {
			jedi2.logComment("---- Preloading Material Libraries ----");
			var materials = preloadManifest.preload.materials;
			for (var m = 0; m < materials.length; ++m) {
				var materialLibId = materials[m];
				jedi2.logComment("Preloading Material lib '" + materialLibId + "'...");

				inFlightLoadRequests++;
				jedi2.Material.loadMaterialLibAsync(materialLibId,
					function (newMaterials, loadInfo) {
						if (newMaterials) {
							for (var n = 0; n < newMaterials.length; ++n) {
								loadedMaterials[newMaterials[n].getName()] = newMaterials[n];
								loadedMaterials.itemCount++;
							}
							jedi2.logComment(loadInfo);
						} else {
							jedi2.logError(loadInfo);
						}
						inFlightLoadRequests--;
						checkPreloadCompletion();
					});
			}
		}

		if (preloadManifest.preload.models && (preloadManifest.preload.models instanceof Array)) {
			jedi2.logComment("---- Preloading 3D Models ----");
			var models = preloadManifest.preload.models;
			for (var m = 0; m < models.length; ++m) {
				var modelId = models[m][0];
				if (loaded3DModels.hasOwnProperty(modelId)) {
					continue; // Already loaded.	
				}

				jedi2.logComment("Preloading 3D model '" + modelId + "'...");
				var mdlObj = new jedi2.Model3D();

				inFlightLoadRequests++;
				mdlObj.initAsyncFromFile(models[m][1],
					function (newModel, loadInfo) {
						if (newModel) {
							loaded3DModels[newModel.getName()] = newModel;
							loaded3DModels.itemCount++;
							jedi2.logComment(loadInfo);
						} else {
							jedi2.logError(loadInfo);
						}
						inFlightLoadRequests--;
						checkPreloadCompletion();
					},
					/* deriveTangents = */ true,
					/* modelName      = */ modelId);
			}
		}

		// Important to also check here, in case the preload manifest was empty.
		checkPreloadCompletion();

		jedi2.logComment("Finished firing async resource preload requests.");
		return true;
	}

	/*
	 * Public interface:
	 */
	return {
		init : function (preloadManifestFileName, onPreloadCompleted) {
			if (resMgrInitialized) {
				jedi2.logWarning("Duplicate ResourceManager initialization!");
				return true;
			}

			jedi2.logComment("---- jedi2.ResourceManager.init() ----");

			// Define a few counters to keep track of resource instances.
			loadedShaderProgs.itemCount = 0;
			loaded3DModels.itemCount    = 0;
			loadedTextures.itemCount    = 0;
			loadedMaterials.itemCount   = 0;

			preloadCompleteCb = onPreloadCompleted;

			// Load the "preload manifest" JSON file. Once done,
			// start downloading the resources.
			if (!preloadManifestFileName) {
				preloadManifestFileName = "preload_manifest.json";
			}

			// Asynchronously fetch the manifest file contents:
			downloadPreloadManifestFile(preloadManifestFileName, function (preloadManifestFileContents) {
				if (!preloadManifestFileContents) {
					jedi2.logError("Failed to get preload manifest! No resources will be preloaded!");
					return;
				}
				// Now we can start pre-loading the resources.
				preloadAll(preloadManifestFileContents);
			});

			jedi2.logComment("ResourceManager initialization completed.");
			return (resMgrInitialized = true);
		},

		isInitialized : function () {
			return resMgrInitialized;
		},

		purgeAllResources : function () {
			// Force dispose all, regardless of being in use.
			var prop, propKey;
			for (propKey in loaded3DModels) {
				prop = loaded3DModels[propKey];
				if (prop instanceof jedi2.Model3D) {
					prop.dispose();
				}
			}
			for (propKey in loadedMaterials) {
				prop = loadedMaterials[propKey];
				if (prop instanceof jedi2.Material) {
					prop.dispose();
				}
			}
			for (propKey in loadedShaderProgs) {
				prop = loadedShaderProgs[propKey];
				if (prop instanceof jedi2.ShaderProgram) {
					prop.dispose();
				}
			}
			for (propKey in loadedTextures) {
				prop = loadedTextures[propKey];
				if (prop instanceof jedi2.Texture) {
					prop.dispose();
				}
			}

			loadedShaderProgs = {};
			loaded3DModels    = {};
			loadedTextures    = {};
			loadedMaterials   = {};

			loadedShaderProgs.itemCount = 0;
			loaded3DModels.itemCount    = 0;
			loadedTextures.itemCount    = 0;
			loadedMaterials.itemCount   = 0;
			inFlightLoadRequests        = 0;

			jedi2.logComment("All resources purged!");
		},

		/*
		 * Note: The following methods will always return a default 
		 * if the requested resource is not available!
		 */

		findShaderProgram : function (programId) {
			jedi2.assert(programId, "Null|undefined ShaderProgram name/id!");
			if (loadedShaderProgs.hasOwnProperty(programId)) {
				return loadedShaderProgs[programId];
			}
			return jedi2.ShaderProgram.getDefault();
		},

		findModel3D : function (modelId) {
			jedi2.assert(modelId, "Null|undefined Model3D name/id!");
			if (loaded3DModels.hasOwnProperty(modelId)) {
				return loaded3DModels[modelId];
			}
			return jedi2.Model3D.getDefault();
		},

		findTexture : function (textureId) {
			jedi2.assert(textureId, "Null|undefined Texture name/id!");
			if (loadedTextures.hasOwnProperty(textureId)) {
				return loadedTextures[textureId];
			}
			return jedi2.Texture.getDefault();
		},

		findMaterial : function (materialId) {
			jedi2.assert(materialId, "Null|undefined Material name/id!");
			if (loadedMaterials.hasOwnProperty(materialId)) {
				return loadedMaterials[materialId];
			}
			return jedi2.Material.getDefault();
		}
	};
}());

