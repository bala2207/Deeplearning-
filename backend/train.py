import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
from tensorflow.keras.applications import VGG16
from tensorflow.keras.callbacks import EarlyStopping

# Dataset path
dataset_path = r"D:\pro_ject\DeepLearning-DeiT-Brain-Stroke-Prediction-main\dataset"

# 🔥 Data Augmentation + Validation
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=15,
    zoom_range=0.2,
    horizontal_flip=True
)

train_data = datagen.flow_from_directory(
    dataset_path,
    target_size=(224, 224),
    batch_size=16,
    class_mode='binary',
    subset='training'
)

val_data = datagen.flow_from_directory(
    dataset_path,
    target_size=(224, 224),
    batch_size=16,
    class_mode='binary',
    subset='validation'
)

# 🔍 Check class labels
print("Class labels:", train_data.class_indices)

# 🔥 VGG16 base model
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(224,224,3))

# Unfreeze last few layers (important improvement)
for layer in base_model.layers[:-4]:
    layer.trainable = False
for layer in base_model.layers[-4:]:
    layer.trainable = True

# 🔥 Build model
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(1, activation='sigmoid')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss='binary_crossentropy',
    metrics=['accuracy']
)

# 🔥 Stop early if no improvement
early_stop = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)

# 🔥 Train
model.fit(
    train_data,
    validation_data=val_data,
    epochs=15,
    callbacks=[early_stop]
)

# Save model
model.save("backend/model/model.h5")