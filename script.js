console.log("js running");
var fileUpload, videoSource, video, result, accuracy, canvasElement, canvasCtx, myInteval, camera;

const uploadVideo = async () => {
    const file = fileUpload.files[0];

    const videoUrl = window.URL.createObjectURL(file);

    videoSource.src = videoUrl;
    videoSource.type = "video/mp4";
    video.load();

    const formData = new FormData();
    formData.append("name", file);
    const res = await fetch("http://127.0.0.1:4000/predict", {
        method: "post",
        body: formData
    });
    const myJson = await res.json();
    result.innerHTML = myJson.result;
    accuracy.innerHTML = `${parseFloat(myJson.probablity).toFixed(4) * 100}%`;
}

function onResults(results) {
    if (!results.poseLandmarks) {
      //grid.updateLandmarks([]);
      return;
    }
  
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0,
                        canvasElement.width, canvasElement.height);
  
    // Only overwrite existing pixels.
    //canvasCtx.globalCompositeOperation = 'source-in';
    //canvasCtx.fillStyle = '#00FF00';
    //canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
  
    // Only overwrite missing pixels.
    //canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
  
    canvasCtx.globalCompositeOperation = 'source-over';
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                   {color: '#00FF00', lineWidth: 4});
    drawLandmarks(canvasCtx, results.poseLandmarks,
                  {color: '#FF0000', lineWidth: 2});
    canvasCtx.restore();
  
    //grid.updateLandmarks(results.poseWorldLandmarks);
  }



const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResults);

 
const openCamera = () => {
    camera = new Camera(video, {
        onFrame: async () => {
          await pose.send({image: video});
        }
    });
    console.log("camera  ", camera);
    camera.start();
}  


const main = async () => {
    fileUpload = document.getElementById('fileUpload');
    videoSource = document.getElementById('video-source');
    video = document.getElementById('video');
    result = document.getElementById("result");
    accuracy = document.getElementById("accuracy")
    canvasElement = document.getElementsByClassName('output_canvas')[0];
    canvasCtx = canvasElement.getContext('2d');
    
    const x = async () => {
        await pose.send({image: video});
    }
    
    video.onplay = (event) => {
        clearInterval(myInteval)
        myInterval = setInterval(() => {
            x();
        }, 500) 
    };
    
    console.log("inside main");
}

window.onload = () => {
    main();
}