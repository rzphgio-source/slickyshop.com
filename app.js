const PRODUCTS=[
 {id:"990k",name:"990K",price:1.50,desc:"A quick pick for your collection.",symbol:"✦",art:"art-1"},
 {id:"2m",name:"2 Million",price:2.50,desc:"More value in one simple pick.",symbol:"✧",art:"art-2"},
 {id:"10dupes",name:"10 Dupes",price:1.50,desc:"A bundle of 10 dupes.",symbol:"▧",art:"art-3"},
 {id:"20dupes",name:"20 Dupes",price:2.50,desc:"A bundle of 20 dupes.",symbol:"▦",art:"art-4"},
 {id:"stacked-alt",name:"Stacked Alt",price:5.00,desc:"The stacked alt option.",symbol:"♟",art:"art-5"}
];
const $=s=>document.querySelector(s); const money=n=>"$"+Number(n).toFixed(2);
let cart={}; let lastOrder=null; let supabaseClient=null;
const cfg=window.SLICKY_CONFIG||{};
if(window.supabase?.createClient && cfg.SUPABASE_URL?.startsWith("https://") && !cfg.SUPABASE_URL.includes("YOUR-PROJECT") && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("YOUR_")) supabaseClient=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
function total(){return PRODUCTS.reduce((s,p)=>s+p.price*(cart[p.id]||0),0)}
function renderProducts(){$("#product-grid").innerHTML=PRODUCTS.map((p,i)=>`<article class="product-card"><div class="product-art ${p.art}"><span class="product-number">ITEM 0${i+1}</span><span class="product-symbol">${p.symbol}</span></div><div class="product-info"><h3>${p.name}</h3><p>${p.desc}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to cart">+</button></div></div></article>`).join("");}
function renderCart(){let count=Object.values(cart).reduce((a,b)=>a+b,0);$("#cart-count").textContent=count;$("#cart-total").textContent=money(total());$("#checkout-total").textContent=money(total());const entries=PRODUCTS.filter(p=>cart[p.id]);$("#cart-items").innerHTML=entries.length?entries.map(p=>`<div class="cart-line"><div class="mini-art">${p.symbol}</div><div class="cart-line-main"><b>${p.name}</b><small>${money(p.price)} each</small></div><div class="qty-controls"><button data-dec="${p.id}" aria-label="Remove one ${p.name}">−</button><span>${cart[p.id]}</span><button data-inc="${p.id}" aria-label="Add one ${p.name}">+</button></div></div>`).join(""):`<p style="color:#777;font-size:13px;padding:20px 0">Your cart is empty. Add a product to get started.</p>`;$("#checkout-open").disabled=count===0;$("#checkout-open").style.opacity=count===0?".5":"1";}
function drawer(open){$("#cart-drawer").classList.toggle("show",open);$("#scrim").classList.toggle("show",open)}
function modal(id,open){$(id).classList.toggle("show",open)}
function add(id,n=1){cart[id]=Math.max(0,(cart[id]||0)+n);if(!cart[id])delete cart[id];renderCart()}
$("#product-grid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b){add(b.dataset.add);drawer(true)}});
$("#cart-items").addEventListener("click",e=>{let b=e.target.closest("button");if(!b)return;if(b.dataset.inc)add(b.dataset.inc,1);if(b.dataset.dec)add(b.dataset.dec,-1)});
$("#cart-open").onclick=()=>drawer(true);$("#cart-close").onclick=()=>drawer(false);$("#scrim").onclick=()=>drawer(false);
$("#checkout-open").onclick=()=>{if(!Object.keys(cart).length)return;drawer(false);modal("#checkout-modal",true)};
$("#checkout-close").onclick=()=>modal("#checkout-modal",false);
$("#payment-close").onclick=()=>modal("#payment-modal",false);$("#done-payment").onclick=()=>modal("#payment-modal",false);
$("#copy-tag").onclick=async()=>{try{await navigator.clipboard.writeText(cfg.CASH_APP_TAG||"$jovannim1");$("#copy-tag").textContent="Copied!";}catch(e){$("#copy-tag").textContent=cfg.CASH_APP_TAG||"$jovannim1"}};
$("#checkout-form").addEventListener("submit",async e=>{e.preventDefault();const btn=$("#place-order"),err=$("#checkout-error");err.textContent="";if(!Object.keys(cart).length){err.textContent="Your cart is empty.";return}
const form=new FormData(e.currentTarget);const payload={customer_name:String(form.get("customer_name")||"").trim(),email:String(form.get("email")||"").trim(),notes:String(form.get("notes")||"").trim(),items:PRODUCTS.filter(p=>cart[p.id]).map(p=>({product_id:p.id,quantity:cart[p.id]}))};
btn.disabled=true;btn.textContent="Creating order…";
try{let order;if(supabaseClient){const {data,error}=await supabaseClient.functions.invoke("create-order",{body:payload});if(error)throw new Error("Could not create the order. Check Supabase setup and Edge Function logs.");order=data;}else{order=await createDemoOrder(payload);}
if(!order?.order_id||!order?.receipt_token)throw new Error("The server response was incomplete. Please try again.");
lastOrder=order;$("#payment-total").textContent=money(order.total);$("#order-created-text").textContent=`Order ${order.order_number||order.order_id} has been created. Your order is pending payment verification.`;const url=new URL("receipt.html",location.href);url.searchParams.set("id",order.order_id);url.searchParams.set("token",order.receipt_token);$("#receipt-link").href=url.toString();$("#cashapp-link").href="https://cash.app/"+encodeURIComponent((cfg.CASH_APP_TAG||"$jovannim1").replace(/^\$/,""));cart={};renderCart();e.currentTarget.reset();modal("#checkout-modal",false);modal("#payment-modal",true);
}catch(ex){err.textContent=ex.message||"Could not create order. Please try again."}finally{btn.disabled=false;btn.textContent="Create order & pay ↗"}});
async function createDemoOrder(payload){ // Preview mode only; real mode requires Supabase configuration.
 const orderId=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
 const token=Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b=>b.toString(16).padStart(2,"0")).join("");
 const products=payload.items.map(i=>{const p=PRODUCTS.find(x=>x.id===i.product_id);if(!p)throw Error("Unknown product");return {product_id:p.id,name:p.name,quantity:i.quantity,unit_price:p.price,line_total:p.price*i.quantity}});
 const order={order_id:orderId,receipt_token:token,order_number:"SS-"+orderId.slice(0,8).toUpperCase(),total:products.reduce((s,p)=>s+p.line_total,0),status:"pending",customer_name:payload.customer_name,email:payload.email,notes:payload.notes,items:products,created_at:new Date().toISOString(),demo:true};
 try{const key="slicky-demo-orders";const all=JSON.parse(localStorage.getItem(key)||"{}");all[orderId]=order;localStorage.setItem(key,JSON.stringify(all));}catch(e){throw Error("Preview storage unavailable. Configure Supabase for real orders.")}return order;
}
$("#year").textContent=new Date().getFullYear();renderProducts();renderCart();