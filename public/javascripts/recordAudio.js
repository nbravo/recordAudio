console.log('sup');
function getByID(id) {
            return document.getElementById(id);
        }

        var recordAudio = getByID('record-audio'),
            recordVideo = getByID('record-video'),
            recordGIF = getByID('record-gif'),
            stopRecordingAudio = getByID('stop-recording-audio'),
            stopRecordingVideo = getByID('stop-recording-video'),
            stopRecordingGIF = getByID('stop-recording-gif');

        var canvasWidth_input = getByID('canvas-width-input'),
            canvasHeight_input = getByID('canvas-height-input');

        if(params.canvas_width) {
            canvasWidth_input.value = params.canvas_width;
        }

        if(params.canvas_height) {
            canvasHeight_input.value = params.canvas_height;
        }

        var video = getByID('video');
        var audio = getByID('audio');

        var videoConstraints = {
            audio: false,
            video: {
                mandatory: {},
                optional: []
            }
        };

        var audioConstraints = {
            audio: true,
            video: false
        };
        </script>
        <script>
        var audioStream;
        var recorder;

        recordAudio.onclick = function() {
            if (!audioStream)
                navigator.getUserMedia(audioConstraints, function(stream) {
                    if (window.IsChrome) stream = new window.MediaStream(stream.getAudioTracks());
                    audioStream = stream;

                    audio.src = URL.createObjectURL(audioStream);
                    audio.muted = true;
                    audio.play();

                    // "audio" is a default type
                    recorder = window.RecordRTC(stream, {
                        type: 'audio',
                        bufferSize: typeof params.bufferSize == 'undefined' ? 4096 : params.bufferSize,
                        sampleRate: typeof params.sampleRate == 'undefined' ? 44100 : params.sampleRate,
                        leftChannel: params.leftChannel || false,
                        disableLogs: params.disableLogs || false
                    });
                    recorder.startRecording();
                }, function() {});
            else {
                audio.src = URL.createObjectURL(audioStream);
                audio.muted = true;
                audio.play();
                if (recorder) recorder.startRecording();
            }

            window.isAudio = true;

            this.disabled = true;
            stopRecordingAudio.disabled = false;
        };

        var screen_constraints;

        function isCaptureScreen() {
            if (document.getElementById('record-screen').checked) {
                document.getElementById('fit-to-screen').onclick();
                screen_constraints = {
                    mandatory: {
                        chromeMediaSource: 'screen',
                        maxWidth: 1920,
                        maxHeight: 1080,
                        minWidth: 1280,
                        minHeight: 720,
                        minAspectRatio: 1.77,
                        minFrameRate: 3,
                        maxFrameRate: 64
                    },
                    optional: []
                };
                videoConstraints.video = screen_constraints;
            }
        }

        recordVideo.onclick = function() {
            isCaptureScreen();
            recordVideoOrGIF(true);
        };

        recordGIF.onclick = function() {
            isCaptureScreen();
            recordVideoOrGIF(false);
        };

        function recordVideoOrGIF(isRecordVideo) {
            navigator.getUserMedia(videoConstraints, function(stream) {
                video.onloadedmetadata = function() {
                    video.width = canvasWidth_input.value || 320;
                    video.height = canvasHeight_input.value || 240;

                    var options = {
                        type: isRecordVideo ? 'video' : 'gif',
                        video: video,
                        canvas: {
                            width: canvasWidth_input.value,
                            height: canvasHeight_input.value
                        },
                        disableLogs: params.disableLogs || false
                    };

                    recorder = window.RecordRTC(stream, options);
                    recorder.startRecording();
                };
                video.src = URL.createObjectURL(stream);
            }, function() {
                if (document.getElementById('record-screen').checked) {
                    if (location.protocol === 'http:')
                        alert('<https> is mandatory to capture screen.');
                    else
                        alert('Multi-capturing of screen is not allowed. Capturing process is denied. Are you enabled flag: "Enable screen capture support in getUserMedia"?');
                } else
                    alert('Webcam access is denied.');
            });

            window.isAudio = false;

            if (isRecordVideo) {
                recordVideo.disabled = true;
                stopRecordingVideo.disabled = false;
            } else {
                recordGIF.disabled = true;
                stopRecordingGIF.disabled = false;
            }
        }

        stopRecordingAudio.onclick = function() {
            this.disabled = true;
            recordAudio.disabled = false;
            audio.src = '';

            if (recorder)
                recorder.stopRecording(function(url) {
                    audio.src = url;
                    audio.muted = false;
                    audio.play();

                    document.getElementById('audio-url-preview').innerHTML = '<a href="' + url + '" target="_blank">Recorded Audio URL</a>';
                });
        };

        stopRecordingVideo.onclick = function() {
            this.disabled = true;
            recordVideo.disabled = false;

            if (recorder)
                recorder.stopRecording(function(url) {
                    video.src = url;
                    video.play();

                    document.getElementById('video-url-preview').innerHTML = '<a href="' + url + '" target="_blank">Recorded Video URL</a>';
                });
        };

        stopRecordingGIF.onclick = function() {
            this.disabled = true;
            recordGIF.disabled = false;

            if (recorder)
                recorder.stopRecording(function(url) {
                    document.getElementById('video-url-preview').innerHTML = '<a href="' + url + '" target="_blank">Recorded Gif URL</a>';
                });
        };
        </script>

        <script>
        document.getElementById('fit-to-screen').onclick = function() {
            this.disabled = true;

            video.width = canvasWidth_input.value = innerWidth;
            video.height = canvasHeight_input.value = innerHeight;
        };
        </script>
