// Ganti URL ini jika Anda mengganti model di Teachable Machine
const URL = "https://teachablemachine.withgoogle.com/models/EfSk3GVda/";

let model, webcam, labelContainer, maxPredictions;
let isRunning = false;
let rafId = null;

async function init() {
  const statusEl = document.getElementById("status");
  document.getElementById("start-btn").disabled = true;
  statusEl.textContent = "Memuat model...";

  try {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);
    await webcam.setup();
    await webcam.play();
    isRunning = true;

    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
      const row = document.createElement("div");
      row.className = "result-row";
      row.innerHTML = `<div class="bar" style="width:0%"></div><div class="text"><span class="label"></span><span class="percent"></span></div>`;
      labelContainer.appendChild(row);
    }

    document.getElementById("stop-btn").disabled = false;
    statusEl.textContent = "Kamera aktif — mendeteksi...";

    loop();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Gagal memuat model. Periksa koneksi internet atau URL model.";
    document.getElementById("start-btn").disabled = false;
  }
}

async function loop() {
  if (!isRunning) return;
  webcam.update();
  await predict();
  rafId = window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  prediction.sort((a, b) => b.probability - a.probability);

  for (let i = 0; i < maxPredictions; i++) {
    const p = prediction[i];
    const percent = (p.probability * 100).toFixed(1);
    const row = labelContainer.children[i];
    row.querySelector(".bar").style.width = percent + "%";
    row.querySelector(".label").textContent = p.className;
    row.querySelector(".percent").textContent = percent + "%";
  }
}

function stopCamera() {
  isRunning = false;
  if (rafId) cancelAnimationFrame(rafId);
  if (webcam) webcam.stop();
  document.getElementById("webcam-container").innerHTML = "";
  document.getElementById("status").textContent = "Kamera dihentikan. Klik \"Mulai Kamera\" untuk mulai lagi.";
  document.getElementById("start-btn").disabled = false;
  document.getElementById("stop-btn").disabled = true;
}
