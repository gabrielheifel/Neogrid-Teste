const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const [url] = process.argv.slice(2);

async function fetchHtml(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Request Error: " + error);
    return null;
  }
}

function getTitle(htmlBody) {
  return htmlBody(".floating-button__box h2").text();
}

function getPrice(htmlBody) {
  return htmlBody(".default-price span strong").text();
}

function getDescription(htmlBody) {
  return htmlBody("#features > p").text();
}

function getInitialImage(htmlBody) {
  return htmlBody(".photo-figure img").attr("src");
}

function getCarouselImages(htmlBody) {
  const images = [];
  htmlBody(".swiper-wrapper li").each(function () {
    images.push(htmlBody(this).find("img").attr("src"));
  });
  return images;
}

function writeToTextFile(data) {
  fs.writeFile("output.txt", data, { flag: "a", encoding: "utf8" },  (err) => {
    if (err) throw err;
    console.log("Os dados foram adicionados ao arquivo output.txt");
  });
}

async function scrapeProduct(url) {
  const html = await fetchHtml(url);
  if (!html) {
    console.log("Url inválida.");
    return;
  }

  const htmlBody = cheerio.load(html);

  const infos = {
    title: getTitle(htmlBody),
    price: getPrice(htmlBody),
    description: getDescription(htmlBody),
    initialImage: getInitialImage(htmlBody),
    carousel: getCarouselImages(htmlBody),
  }
  console.log(infos);

  writeToTextFile(
    `\n\n******* ${url} *******
    \n\n******* Title *******\n\n ${getTitle(htmlBody)}
    \n\n******* Price *******\n\n ${getPrice(htmlBody)}
    \n\n******* Description *******\n\n ${getDescription(htmlBody)}
    \n\n******* Initial image *******\n\n ${getInitialImage(htmlBody)}
    \n\n******* Carousel images *******\n\n ${getCarouselImages(htmlBody).join('\n')}
    \n#################################################################################
    ` 
  );
}

if (url) {
  scrapeProduct(url);
} else {
  console.log(
    "Erro: Por favor envie a url do produto que deseja extrair os dados.\n  Siga a sintax Node index.js <link de produto na Loja netShoes>, para mais informações leia o readMe."
  );
}
