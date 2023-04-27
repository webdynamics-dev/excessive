import products from "./products.js";
import { renderRatingStars } from "./renderItem.js";

console.log(window.location.href);

let url = window.location.href;

console.log(url.split("?")[1]); //da se trgne

let idTag = url.split("?")[1].toString();

let itemID = products.find((item) => {
  return item.id == idTag;
});

console.log(itemID); //da se trgne

function renderItem(itemID) {
  let itemDetails = document.querySelector(".item-details");
  let itemImages = document.querySelector(".item-images");

  itemImages.innerHTML = `<div id="first-image" class="item-image"><img src="${itemID.image}"></div><div class="item-image"><img src="${itemID.image}"></div><div class="item-image"><img src="${itemID.image}"></div><div class="item-image"><img src="${itemID.image}"></div><div class="item-image"><img src="${itemID.image}"></div><div class="item-image"><img src="${itemID.image}"></div><div class="item-image"><img src="${itemID.image}"></div>`;

  itemDetails.innerHTML = `<h1>${itemID.title}</h1>
    
    <div class="item-desc">${itemID.desc}</div>
    <div class="item-price">${itemID.price}</div>
    
    <div class="rating">Rate this product:
    <div class="product-stars">${renderRatingStars(
      itemID.rating
    )}<span class="rating-value">${itemID.rating}</span></div>
    </div>`;
}

renderItem(itemID);

document.title = itemID.title;

document
  .querySelector('meta[name="description"]')
  .setAttribute("content", itemID.desc);
