import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
const catalog: Record<string,{name:string;price:number}> = {
 "990k":{name:"990K",price:1.50},"2m":{name:"2 Million",price:2.50},
 "10dupes":{name:"10 Dupes",price:1.50},"20dupes":{name:"20 Dupes",price:2.50},
 "stacked-alt":{name:"Stacked Alt",price:5.00}
};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,"Content-Type":"application/json"}});
async function sha256(s:string){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("")}
Deno.serve(async req=>{if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});if(req.method!=="POST")return json({error:"Method not allowed"},405);
try{const body=await req.json();const name=String(body.customer_name||"").trim(),email=String(body.email||"").trim(),notes=String(body.notes||"").trim(),items=body.items;
if(name.length<1||name.length>100||!/^.+@.+\..+$/.test(email)||email.length>254||notes.length>500||!Array.isArray(items)||items.length<1||items.length>20) return json({error:"Invalid order details"},400);
const clean=[];const seen=new Set<string>();let total=0;
for(const item of items){const id=String(item.product_id||""),qty=Number(item.quantity);if(!catalog[id]||!Number.isInteger(qty)||qty<1||qty>50||seen.has(id))return json({error:"Invalid cart item"},400);seen.add(id);const p=catalog[id];const line=Number((p.price*qty).toFixed(2));total+=line;clean.push({product_id:id,name:p.name,quantity:qty,unit_price:p.price,line_total:line});}
total=Number(total.toFixed(2));if(total<=0||total>10000)return json({error:"Invalid order total"},400);
const token=Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,"0")).join("");
const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const orderNumber="SS-"+crypto.randomUUID().slice(0,8).toUpperCase();
const {data,error}=await supabase.from("slicky_orders").insert({order_number:orderNumber,receipt_token_hash:await sha256(token),customer_name:name,email,notes,items:clean,total,status:"pending"}).select("id,order_number,total,status,created_at").single();
if(error)throw error;
return json({order_id:data.id,order_number:data.order_number,total:Number(data.total),status:data.status,created_at:data.created_at,receipt_token:token});
}catch(e){console.error(e);return json({error:"Could not create order"},500)}});