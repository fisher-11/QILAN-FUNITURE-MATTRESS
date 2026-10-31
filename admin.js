let adminProducts = [];

let adminOrders = [];


/* ================= LOGIN ================= */

async function login(){

    const username =
    document.getElementById("username").value;

    const password =
    document.getElementById("password").value;


    try{

        const response =
        await fetch("/api/admin/login",{

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({
                username,
                password
            })

        });


        const result =
        await response.json();


        if(result.success){

            sessionStorage.setItem(
                "qilanAdmin",
                "true"
            );

            showDashboard();

        }else{

            document
            .getElementById("loginMessage")
            .innerText =
            "Wrong username or password.";

        }


    }catch(error){

        document
        .getElementById("loginMessage")
        .innerText =
        "Server is not running.";

    }

}


/* ================= DASHBOARD ================= */

function showDashboard(){

    document
    .getElementById("loginSection")
    .style.display = "none";

    document
    .getElementById("dashboardSection")
    .style.display = "block";

    loadAdminData();

}


function logout(){

    sessionStorage.removeItem(
        "qilanAdmin"
    );

    location.reload();

}


/* ================= DATA ================= */

async function loadAdminData(){

    await loadAdminProducts();

    await loadAdminOrders();

}


/* ================= PRODUCTS ================= */

async function loadAdminProducts(){

    const response =
    await fetch("/api/products");

    adminProducts =
    await response.json();


    document
    .getElementById("productCount")
    .innerText =
    adminProducts.length;


    renderProducts();

}


function renderProducts(){

    const table =
    document.getElementById(
        "productsTable"
    );


    table.innerHTML =

    adminProducts.map(product => `

        <tr>

            <td>
                ${product.id}
            </td>

            <td>
                ${product.name}
            </td>

            <td>
                ${product.category}
            </td>

            <td>
                Rwf
                ${Number(product.price).toLocaleString()}
            </td>

            <td>

                <button
                class="small-btn edit-btn"
                onclick="editProduct(${product.id})">

                    Edit

                </button>

                <button
                class="small-btn delete-btn"
                onclick="deleteProduct(${product.id})">

                    Delete

                </button>

            </td>

        </tr>

    `).join("");

}


/* ================= SAVE PRODUCT ================= */

async function saveProduct(){

    const editId =
    document.getElementById("editId").value;


    const product = {

        name:
        document.getElementById("productName").value,

        category:
        document.getElementById("productCategory").value,

        price:
        Number(
            document.getElementById("productPrice").value
        ),

        width:
        Number(
            document.getElementById("productWidth").value
        ),

        length:
        Number(
            document.getElementById("productLength").value
        ),

        height:
        Number(
            document.getElementById("productHeight").value
        ),

        image:
        document.getElementById("productImage").value,

        description:
        document.getElementById("productDescription").value

    };


    if(
        !product.name ||
        !product.price
    ){

        alert(
            "Product name and price are required."
        );

        return;
    }


    let url = "/api/products";

    let method = "POST";


    if(editId){

        url =
        "/api/products/" +
        editId;

        method = "PUT";

    }


    const response =
    await fetch(url,{

        method:method,

        headers:{
            "Content-Type":
            "application/json"
        },

        body:
        JSON.stringify(product)

    });


    const result =
    await response.json();


    if(result.success){

        alert(
            editId ?
            "Product updated." :
            "Product added."
        );

        resetForm();

        loadAdminProducts();

    }else{

        alert(
            result.error ||
            "Something went wrong."
        );

    }

}


/* ================= EDIT ================= */

function editProduct(id){

    const product =
    adminProducts.find(
        item =>
        Number(item.id) === Number(id)
    );


    if(!product){
        return;
    }


    document
    .getElementById("editId")
    .value =
    product.id;


    document
    .getElementById("productName")
    .value =
    product.name;


    document
    .getElementById("productCategory")
    .value =
    product.category;


    document
    .getElementById("productPrice")
    .value =
    product.price;


    document
    .getElementById("productWidth")
    .value =
    product.width;


    document
    .getElementById("productLength")
    .value =
    product.length;


    document
    .getElementById("productHeight")
    .value =
    product.height;


    document
    .getElementById("productImage")
    .value =
    product.image;


    document
    .getElementById("productDescription")
    .value =
    product.description;


    document
    .getElementById("formTitle")
    .innerText =
    "Edit Product";


    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}


/* ================= DELETE ================= */

async function deleteProduct(id){

    if(
        !confirm(
            "Delete this product?"
        )
    ){

        return;

    }


    const response =
    await fetch(
        "/api/products/" + id,
        {
            method:"DELETE"
        }
    );


    const result =
    await response.json();


    if(result.success){

        loadAdminProducts();

    }

}


/* ================= RESET ================= */

function resetForm(){

    document
    .getElementById("editId")
    .value = "";


    document
    .getElementById("productName")
    .value = "";


    document
    .getElementById("productPrice")
    .value = "";


    document
    .getElementById("productWidth")
    .value = "";


    document
    .getElementById("productLength")
    .value = "";


    document
    .getElementById("productHeight")
    .value = "";


    document
    .getElementById("productImage")
    .value = "";


    document
    .getElementById("productDescription")
    .value = "";


    document
    .getElementById("formTitle")
    .innerText =
    "Add Product";

}


/* ================= ORDERS ================= */

async function loadAdminOrders(){

    const response =
    await fetch("/api/orders");

    adminOrders =
    await response.json();


    document
    .getElementById("orderCount")
    .innerText =
    adminOrders.length;


    const pending =
    adminOrders.filter(
        order =>
        order.status === "Pending"
    );


    document
    .getElementById("pendingCount")
    .innerText =
    pending.length;


    renderOrders();

}


function renderOrders(){

    const table =
    document.getElementById(
        "ordersTable"
    );


    table.innerHTML =

    adminOrders.map(order => `

        <tr>

            <td>
                #${order.id}
            </td>

            <td>
                ${order.product_name}
            </td>

            <td>
                ${order.customer_name}
            </td>

            <td>
                ${order.phone}
            </td>

            <td>
                ${order.width} ×
                ${order.length} ×
                ${order.height}
                cm
            </td>

            <td>
                ${order.quantity}
            </td>

            <td>
                Rwf
                ${Number(order.total).toLocaleString()}
            </td>

            <td>

                <select
                class="status-select"
                onchange="changeStatus(${order.id},this.value)">

                    <option
                    ${order.status === "Pending" ? "selected":""}>
                        Pending
                    </option>

                    <option
                    ${order.status === "Confirmed" ? "selected":""}>
                        Confirmed
                    </option>

                    <option
                    ${order.status === "Delivered" ? "selected":""}>
                        Delivered
                    </option>

                    <option
                    ${order.status === "Cancelled" ? "selected":""}>
                        Cancelled
                    </option>

                </select>

            </td>

            <td>

                <button
                class="small-btn delete-btn"
                onclick="deleteOrder(${order.id})">

                    Delete

                </button>

            </td>

        </tr>

    `).join("");

}


/* ================= ORDER STATUS ================= */

async function changeStatus(id,status){

    await fetch(
        "/api/orders/" + id,
        {

            method:"PUT",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify({
                status
            })

        }
    );


    loadAdminOrders();

}


/* ================= DELETE ORDER ================= */

async function deleteOrder(id){

    if(
        !confirm(
            "Delete this order?"
        )
    ){

        return;

    }


    await fetch(
        "/api/orders/" + id,
        {
            method:"DELETE"
        }
    );


    loadAdminOrders();

}


/* ================= START ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if(
            sessionStorage.getItem(
                "qilanAdmin"
            ) === "true"
        ){

            showDashboard();

        }

    }
);