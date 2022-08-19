
importScripts('lib/tf.js');
importScripts('lib/facemesh/facemesh.js');

// Don't use CPU backend for facemesh.
// It's too slow to be useful, without advanced time travel technology. (I have dabbled in time travel, but not cracked it.)
// If the facemesh worker fails to get a WebGL context, it's better that we keep using clmTracker.
// tf.setBackend('cpu');
tf.setBackend('webgl').then((success) => {
	if (!success) {
		console.log("tf.setBackend('webgl') failed");
		close();
	}
}, (error) => {
	console.log("tf.setBackend('webgl') error", error);
	close();
});

var facemeshTensorFlowModel;

onmessage = (e) => {
	// console.log('Message received from main script', e.data);
	if (e.data.type === "LOAD") {
		facemesh.load(e.data.options).then((model) => {
			facemeshTensorFlowModel = model;
			postMessage({ type: "LOADED" });
		});
	} else if (e.data.type === "ESTIMATE_FACES") {
		facemeshTensorFlowModel.estimateFaces(e.data.imageData).then((predictions) => {
			postMessage({ type: "ESTIMATED_FACES", predictions });
		}, (error) => {
			console.log(error);
		});
	}
};
