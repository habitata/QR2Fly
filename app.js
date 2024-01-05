const fs = require('fs');
const { createCanvas, loadImage, registerFont } = require('canvas');
const { QRCodeCanvas } = require('@loskir/styled-qr-code-node');

registerFont('./fonts/Montserrat-Bold.ttf', { family: 'Montserrat Bold' });

const codes = [
  'A8tR2',
  'bF9sE',
  'Cp47d',
  'D6gHm',
  'E23sN',
  'F5hTk',
  'G1uJl',
  'hI7rP',
  'F5hTk',
  'A8tR2',
  'bF9sE',
  'Cp47d',
  'D6gHm',
  'E23sN',
  'F5hTk',
  'G1uJl',
  'hI7rP',
  'F5hTk',
];

const canvasWidth = 2480;
const canvasHeight = 3508;
const flyerWidth = canvasWidth / 3;
const flyerHeight = canvasHeight / 3;
const qrSize = 500;
const marginY = 197;
const marginText = 226;
const fontSize = 136;

const url = 'https://radioir.ru/awards/2023';

const startTime = Date.now();

const createFlyer = async (ctx, code, x, y) => {
  const qrUrl = `${url}/${code}`;
  const qrCode = await new QRCodeCanvas({
    width: 500,
    height: 500,
    data: qrUrl,
    margin: 0,
    qrOptions: {
      typeNumber: '0',
      mode: 'Byte',
      errorCorrectionLevel: 'Q',
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.5,
      margin: 20,
    },
    dotsOptions: {
      type: 'extra-rounded',
      color: '#741414',
    },
    backgroundOptions: {
      color: '#ffffff',
    },
    image: './templates/logo.png',
    dotsOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
    },
    cornersSquareOptions: {
      type: 'extra-rounded',
      color: '#000000',
    },
    cornersSquareOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
    },
    cornersDotOptions: {
      type: '',
      color: '#e80404',
    },
    cornersDotOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
    },
    backgroundOptionsHelper: {
      colorType: {
        single: true,
        gradient: false,
      },
    },
  }).toDataUrl();
  const qrImage = await loadImage(qrCode);
  ctx.drawImage(qrImage, x + (flyerWidth - qrSize) / 2, y + marginY);

  const gradient = ctx.createLinearGradient(
    x,
    y + qrSize + marginY + marginText,
    x,
    y + qrSize + marginY + marginText + fontSize
  );
  gradient.addColorStop(0, 'white');
  gradient.addColorStop(1, '#d5ab73');

  ctx.fillStyle = gradient;
  ctx.font = `bold ${fontSize}px 'Montserrat Bold'`;
  ctx.fillText(
    code,
    x + (flyerWidth - ctx.measureText(code).width) / 2,
    y + qrSize + marginY + marginText + fontSize
  );
};

const generateFlyers = async () => {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  const backgroundImage = await loadImage('./templates/template.png');

  let currentX = 0;
  let currentY = 0;
  let counter = 0;
  let pageIndex = 1;

  ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

  for (const code of codes) {
    if (counter === 9) {
      const fileName = `flyers_page_${pageIndex}.png`;
      fs.writeFileSync('./flyers/' + fileName, canvas.toBuffer('image/png'));
      console.log(`Created ${fileName}`);

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

      counter = 0;
      pageIndex++;
      currentX = 0;
      currentY = 0;
    }

    await createFlyer(ctx, code, currentX, currentY);

    currentX += flyerWidth;
    counter++;

    if (counter % 3 === 0) {
      currentX = 0;
      currentY += flyerHeight;
    }
  }

  if (counter > 0) {
    const fileName = `flyers_page_${pageIndex}.png`;
    fs.writeFileSync('./flyers/' + fileName, canvas.toBuffer('image/png'));
    console.log(`Created ${fileName}`);
  }

  const elapsedTime = (Date.now() - startTime) / 1000;
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  const timeMessage =
    minutes > 0
      ? `Time spent creating flyer(s) - ${minutes} minute(s) ${seconds.toFixed(
          2
        )} second(s)`
      : `Time spent creating flyer(s) - ${seconds.toFixed(2)} second(s)`;

  console.log(timeMessage);
};

generateFlyers();
