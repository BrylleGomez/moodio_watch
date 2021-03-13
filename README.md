# Mood.io - IoT-Based Smart Home Solution with Mood Detection (Smart Watch component)
Mood.io is an IoT-based smart home solution developed by myself, Danayal Khan, Mohamed Mansour, and Karam Ahfid. It detects the mood of its tenant/s and modifies home conditions according to the mood detected. Mood detection involved the use of facial recognition (deep learning) and heart rate measurement (Samsung Gear S3 Frontier smart watch), whereas home conditions modified include light levels, ambient scent, and music. The system frontend was designed using HTML, JavaScript, and CSS for the web interface and HTML, JavaScript, and Tizen for smart watch interface. The backend was designed using Node.js and CouchDB with MQTT for communication.

## Demo Video

[![MOOD.IO DEMO VIDEO](http://img.youtube.com/vi/lnXVw-Ndilk/0.jpg)](http://www.youtube.com/watch?v=lnXVw-Ndilk)

## Components

### 1. Facial Recognition
Facial recognition is done on a computer using a webcam and a deep learning [library](https://github.com/omar178/Emotion-recognition) by omar178. Within the design, the webcam is tasked to take a snapshot of the user's face and use this image to calculate a predicted mood for the user (angry, sad, or happy). 
