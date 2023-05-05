const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const [url] = process.argv.slice(2);

async function fetchHtml(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
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
  htmlBody(".swiper-wrapper li").each(() => {
    images.push(htmlBody(this).find("img").attr("src"));
  });
  return images;
}

function writeToTextFile(data) {
  fs.writeFile("output.txt", JSON.stringify(data, null, 2), { 
    flag: "a", 
    encoding: "utf8" 
  }, (error) => {
    if (error) throw error;
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
  writeToTextFile(infos);
}

if (url) {
  scrapeProduct(url);
} else {
  console.log(
    "Erro: Por favor envie a url do produto que deseja extrair os dados.\n  Siga a sintax Node index.js <link de produto na Loja Netshoes>, para mais informações leia o Readme."
  );
}
