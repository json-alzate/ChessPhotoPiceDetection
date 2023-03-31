import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { Camera, CameraResultType } from '@capacitor/camera';

import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
})
export class HomePage {

  loading = false;

  urlImg!: string | undefined;

  model!: tmImage.CustomMobileNet;
  maxPredictions!: number;
  predictionResult!: string;

  constructor() { }


  async takePicture() {
    this.loading = true;
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
    });

    const imageUrl = image.base64String as string;
    this.urlImg = imageUrl;

    // Load model if it's not loaded yet
    if (!this.model) {
      await this.loadModel();
    }

    // Predict the label
    this.predictionResult = await this.predict(imageUrl);
    this.loading = false;
  }



  async loadModel() {
    const modelURL = '/assets/tm-my-image-model/model.json';
    const metadataURL = '/assets/tm-my-image-model/metadata.json';

    this.model = await tmImage.load(modelURL, metadataURL);
    this.maxPredictions = this.model.getTotalClasses();
  }


  async predict(base64Image: string) {


    // Convert base64 image to HTMLImageElement
    const image = new Image();
    image.src = 'data:image/jpeg;base64,' + base64Image;

    await new Promise((resolve) => (image.onload = resolve));

    // Run prediction
    const prediction = await this.model.predict(image);

    // Find the prediction with the highest probability
    let highestProbability = -1;
    let bestClassName = '';
    for (let i = 0; i < this.maxPredictions; i++) {
      if (prediction[i].probability > highestProbability) {
        highestProbability = prediction[i].probability;
        bestClassName = prediction[i].className;
      }
    }

    return bestClassName;
  }





}
