let products = [];

let selectedProduct = null;

let cart = [];


/* ================= LOAD PRODUCTS ================= */

async function loadProducts(){

    const grid =
    document.getElementById("productsGrid");

    grid.innerHTML =
    `<div class="loading">Loading products...</div>`;

    try{

        const response =
        await fetch("/api/products");

        products =
        await response.json();

        displayProducts(products);

    }catch(error){

        grid.innerHTML =
        `<div class="loading">
            Cannot connect to backend.
        </div>`;

        console.error(error);
    }
}


/* ================= DISPLAY ================= */

function displayProducts(list){

    const grid =
    document.getElementById("productsGrid");

    if(list.length === 0){

        grid.innerHTML =
        `<div class="loading">
            No products found.
        </div>`;

        return;
    }


    grid.innerHTML =
    list.map(product => `

        <article class="product-card">

            <div class="product-image">

                <img
                src="${product.image || "images/bed.jpg"}"
                alt="${product.name}"
                onerror="this.src='images/bed.jpg'">

            </div>


            <div class="product-info">

                <div class="product-category">
                    ${product.category}
                </div>

                <h3>
                    ${product.name}
                </h3>

                <p class="product-description">
                    ${product.description || ""}
                </p>

                <div class="product-measure">

                    📐
                    ${product.width || "-"} ×
                    ${product.length || "-"} ×
                    ${product.height || "-"} cm

                </div>


                <div class="product-bottom">

                    <div class="product-price">

                        Rwf
                        ${Number(product.price).toLocaleString()}

                    </div>

                    <button
                    class="order-button"
                    onclick="openOrder(${product.id})">

                        Order

                    </button>

                </div>

            </div>

        </article>

    `).join("");
}


/* ================= CATEGORY ================= */

function filterCategory(category){

    if(!products.length){
        loadProducts();
        return;
    }

    const filtered =
    products.filter(
        product =>
        product.category === category
    );

    displayProducts(filtered);

    document
    .getElementById("products")
    .scrollIntoView();
}


/* ================= ORDER ================= */

function openOrder(productId){

    selectedProduct =
    products.find(
        product =>
        Number(product.id) === Number(productId)
    );

    if(!selectedProduct){
        return;
    }

    document
    .getElementById("selectedProduct")
    .innerHTML = `

        <strong>${selectedProduct.name}</strong>

        <br>

        Rwf
        ${Number(selectedProduct.price).toLocaleString()}

    `;


    document
    .getElementById("orderWidth")
    .value =
    selectedProduct.width || "";


    document
    .getElementById("orderLength")
    .value =
    selectedProduct.length || "";


    document
    .getElementById("orderHeight")
    .value =
    selectedProduct.height || "";


    document
    .getElementById("orderQuantity")
    .value = 1;


    document
    .getElementById("orderModal")
    .style.display = "flex";


    updateTotal();
}


function closeOrder(){

    document
    .getElementById("orderModal")
    .style.display = "none";

}


/* ================= TOTAL ================= */

function updateTotal(){

    if(!selectedProduct){
        return;
    }

    const quantity =
    Number(
        document.getElementById("orderQuantity").value
    ) || 1;


    const total =
    Number(selectedProduct.price) *
    quantity;


    document
    .getElementById("orderTotal")
    .innerText =
    "Rwf " +
    total.toLocaleString();
}


/* ================= SUBMIT ORDER ================= */

async function submitOrder(){

    if(!selectedProduct){
        return;
    }


    const quantity =
    Number(
        document.getElementById("orderQuantity").value
    ) || 1;


    const total =
    Number(selectedProduct.price) *
    quantity;


    const order = {

        product_id:selectedProduct.id,

        product_name:selectedProduct.name,

        width:
        Number(
            document.getElementById("orderWidth").value
        ),

        length:
        Number(
            document.getElementById("orderLength").value
        ),

        height:
        Number(
            document.getElementById("orderHeight").value
        ),

        color:
        document.getElementById("orderColor").value,

        quantity:quantity,

        customer_name:
        document.getElementById("customerName").value,

        phone:
        document.getElementById("customerPhone").value,

        district:
        document.getElementById("district").value,

        sector:
        document.getElementById("sector").value,

        cell:
        document.getElementById("cell").value,

        village:
        document.getElementById("village").value,

        payment:
        document.getElementById("payment").value,

        total:total

    };


    if(
        !order.customer_name ||
        !order.phone
    ){

        alert("Please enter your name and phone number.");

        return;
    }


    try{

        const response =
        await fetch("/api/orders",{

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify(order)

        });


        const result =
        await response.json();


        if(!response.ok){

            alert(
                result.error ||
                "Order failed."
            );

            return;
        }


        addToCart(order);


        let message =

`Hello Qilan Furniture 👋

I want to order:

Product: ${order.product_name}

Measurement:
Width: ${order.width} cm
Length: ${order.length} cm
Height: ${order.height} cm

Color: ${order.color}
Quantity: ${order.quantity}

Total: Rwf ${order.total.toLocaleString()}

Customer: ${order.customer_name}
Phone: ${order.phone}

Location:
District: ${order.district}
Sector: ${order.sector}
Cell: ${order.cell}
Village: ${order.village}

Payment: ${order.payment}

Order ID: ${result.orderId}`;


        const whatsappNumber =
        "250789470492";


        const whatsappURL =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


        window.open(
            whatsappURL,
            "_blank"
        );


        alert(
            "Order saved successfully. Order ID: " +
            result.orderId
        );


        closeOrder();


    }catch(error){

        console.error(error);

        alert(
            "Cannot connect to server."
        );
    }

}


/* ================= CART ================= */

function addToCart(order){

    cart.push(order);

    document
    .getElementById("cartCount")
    .innerText =
    cart.length;
}


function openCart(){

    const modal =
    document.getElementById("cartModal");

    const items =
    document.getElementById("cartItems");


    if(cart.length === 0){

        items.innerHTML =
        "<p>Your cart is empty.</p>";

    }else{

        items.innerHTML =
        cart.map((item,index)=>`

            <div class="search-result">

                <strong>
                    ${item.product_name}
                </strong>

                <br>

                Quantity:
                ${item.quantity}

                <br>

                Total:
                Rwf ${item.total.toLocaleString()}

            </div>

        `).join("");

    }


    modal.style.display = "flex";
}


function closeCart(){

    document
    .getElementById("cartModal")
    .style.display = "none";

}


/* ================= SEARCH ================= */

function openSearch(){

    document
    .getElementById("searchModal")
    .style.display =
    "flex";

    document
    .getElementById("searchInput")
    .focus();
}


function closeSearch(){

    document
    .getElementById("searchModal")
    .style.display =
    "none";

}


function searchProducts(){

    const query =
    document
    .getElementById("searchInput")
    .value
    .toLowerCase()
    .trim();


    const results =
    products.filter(product =>
        product.name
        .toLowerCase()
        .includes(query)
    );


    document
    .getElementById("searchResults")
    .innerHTML =

    results.map(product => `

        <div
        class="search-result"
        onclick="selectSearchProduct(${product.id})">

            <strong>
                ${product.name}
            </strong>

            <br>

            Rwf
            ${Number(product.price).toLocaleString()}

        </div>

    `).join("");
}


function selectSearchProduct(id){

    closeSearch();

    openOrder(id);
}


/* ================= MESSAGE ================= */

function showMessage(message){

    alert(message);

}


/* ================= START ================= */

document.addEventListener(
    "DOMContentLoaded",
    loadProducts
);

// =========================
// QILAN HERO SLIDER
// =========================

const heroSlides = document.querySelectorAll(".hero-slide");
const heroDots = document.querySelectorAll(".hero-dots span");

let currentHeroSlide = 0;

function showHeroSlide(index) {

    heroSlides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
    });

    heroDots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });
}

setInterval(() => {

    currentHeroSlide++;

    if (currentHeroSlide >= heroSlides.length) {
        currentHeroSlide = 0;
    }

    showHeroSlide(currentHeroSlide);

}, 4000);
// QILAN LOADING ANIMATION

document.addEventListener("DOMContentLoaded", function () {

    const loader = document.getElementById("qilan-loader");
    const progress = document.getElementById("loader-progress");
    const percent = document.getElementById("loader-percent");

    if (!loader || !progress || !percent) return;

    let loading = 0;

    const timer = setInterval(function () {

        loading += 2;

        if (loading > 100) loading = 100;

        progress.style.width = loading + "%";
        percent.textContent = loading + "%";

        if (loading >= 100) {
            clearInterval(timer);

            setTimeout(function () {
                loader.classList.add("loader-hidden");

                setTimeout(function () {
                    loader.remove();
                }, 850);

            }, 350);
        }

    }, 35);

});