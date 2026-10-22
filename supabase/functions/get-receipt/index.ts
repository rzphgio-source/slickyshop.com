import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,"Content-Type":"application/json"}});
async function sha256(s:string){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("")}
Deno.serve(async req=>{if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});if(req.method!=="POST")return json({error:"Method not allowed"},405);
try{const {order_id,receipt_token}=await req.json();if(typeof order_id!=="string"||typeof receipt_token!=="string"||receipt_token.length<32)return json({error:"Receipt not found"},404);
const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const {data,error}=await supabase.from("slicky_orders").select("id,order_number,items,total,status,created_at,paid_at,receipt_token_hash").eq("id",order_id).maybeSingle();
if(error||!data||data.receipt_token_hash!==await sha256(receipt_token))return json({error:"Receipt not found"},404);
const {receipt_token_hash,...safe}=data;return json(safe);
}catch(e){console.error(e);return json({error:"Could not load receipt"},500)}});