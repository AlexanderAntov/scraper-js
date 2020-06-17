This neural network has been implemented with tensorflow-gpu 2.2.0 and trained on Nvidia Geforce RTX 2060 using Cuda 10.1 and cuDNN 7.6.5. The network has been trained to evaluate the sentiment of a block of text and provide output that indicates whether it is positive or negative. The Keras IMDB test set has been used for the training.
This is the training and test log:

```
118/118 [==============================] - 5s 40ms/step - loss: 0.7144 - acc: 0.5055 - val_loss: 0.6944 - val_acc: 0.4947
Epoch 2/10
118/118 [==============================] - 4s 36ms/step - loss: 0.6949 - acc: 0.4978 - val_loss: 0.6931 - val_acc: 0.5044
Epoch 3/10
118/118 [==============================] - 4s 36ms/step - loss: 0.6935 - acc: 0.5022 - val_loss: 0.6933 - val_acc: 0.5053
Epoch 4/10
118/118 [==============================] - 4s 36ms/step - loss: 0.6932 - acc: 0.5110 - val_loss: 0.6922 - val_acc: 0.5002
Epoch 5/10
118/118 [==============================] - 4s 36ms/step - loss: 0.6828 - acc: 0.5589 - val_loss: 0.6906 - val_acc: 0.5155
Epoch 6/10
118/118 [==============================] - 4s 36ms/step - loss: 0.5561 - acc: 0.7081 - val_loss: 0.4729 - val_acc: 0.7926
Epoch 7/10
118/118 [==============================] - 4s 36ms/step - loss: 0.3632 - acc: 0.8601 - val_loss: 0.3990 - val_acc: 0.8256
Epoch 8/10
118/118 [==============================] - 4s 36ms/step - loss: 0.2893 - acc: 0.8950 - val_loss: 0.3507 - val_acc: 0.8585
Epoch 9/10
118/118 [==============================] - 4s 36ms/step - loss: 0.2069 - acc: 0.9296 - val_loss: 0.3599 - val_acc: 0.8576
Epoch 10/10
118/118 [==============================] - 4s 36ms/step - loss: 0.1657 - acc: 0.9457 - val_loss: 0.3700 - val_acc: 0.8676
782/782 [==============================] - 5s 7ms/step - loss: 0.3721 - acc: 0.8492
```