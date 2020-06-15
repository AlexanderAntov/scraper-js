import os
import tensorflow as tf

#if GPU
physical_devices = tf.config.list_physical_devices('GPU')
tf.config.experimental.set_memory_growth(physical_devices[0], enable=True)
#if CPU
#os.environ['CUDA_DEVICE_ORDER'] = 'PCI_BUS_ID'
#os.environ['CUDA_VISIBLE_DEVICES'] = '0'

imdb = tf.keras.datasets.imdb

dict_size = 10000
(train_data, train_labels), (test_data, test_labels) = imdb.load_data(num_words=dict_size)
word_index = imdb.get_word_index()

word_index = {k:(v+3) for k,v in word_index.items()} 
word_index['<PAD>'] = 0
word_index['<START>'] = 1
word_index['<UNK>'] = 2
word_index['<UNUSED>'] = 3

reverse_word_index = dict([(value, key) for (key, value) in word_index.items()])

def decode_review(text):
    return ' '.join([reverse_word_index.get(i, '?') for i in text])

decode_review(train_data[0])
train_data = tf.keras.preprocessing.sequence.pad_sequences(train_data,
                                                        value=word_index['<PAD>'],
                                                        padding='post',
                                                        maxlen=256)
test_data = tf.keras.preprocessing.sequence.pad_sequences(test_data,
                                                       value=word_index['<PAD>'],
                                                       padding='post',
                                                       maxlen=256)
model = tf.keras.Sequential([
    tf.keras.layers.Embedding(dict_size, 32),  
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64)),
    tf.keras.layers.Dense(64, activation='sigmoid'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(1, activation='sigmoid')
])
model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['acc'])

x_val = train_data[:dict_size]
partial_x_train = train_data[dict_size:]

y_val = train_labels[:dict_size]
partial_y_train = train_labels[dict_size:]

history = model.fit(
    partial_x_train,
    partial_y_train,
    epochs=10,
    batch_size=128,
    validation_data=(x_val, y_val),
    verbose=1
)

results = model.evaluate(test_data, test_labels)
model.save('text-sentiment')