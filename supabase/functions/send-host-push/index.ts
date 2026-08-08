import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY=Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY=Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT=Deno.env.get("VAPID_SUBJECT")!;

webpush.setVapidDetails(VAPID_SUBJECT,VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY);
const db=createClient(SUPABASE_URL,SERVICE);

async function sendHostPush() {
  const {data:subs}=await db.from("push_subscriptions").select("id,subscription").eq("is_host",true);
  const results=[];
  for(const row of subs||[]){
    try{
      await webpush.sendNotification(row.subscription,JSON.stringify({
        title:"GRU PRIORITY TRANSMISSION",
        body:"Scarlet Overkill is attempting to contact you.",
        url:"./?scarlet_push=1"
      }));
      results.push({id:row.id,ok:true});
    }catch(e){results.push({id:row.id,ok:false,error:String(e)})}
  }
  return results;
}

async function reserveRandomGuest(){
  const {data:eligible,error}=await db
    .from("guests")
    .select("*")
    .eq("status","available")
    .eq("completed",false);
  if(error||!eligible?.length)return null;
  const guest=eligible[Math.floor(Math.random()*eligible.length)];
  const {data,error:updateError}=await db
    .from("guests")
    .update({status:"reserved",hijacked:false})
    .eq("id",guest.id)
    .eq("status","available")
    .select()
    .maybeSingle();
  if(updateError||!data)return null;
  return data;
}

async function schedulerTick(force=false){
  const {data:state,error}=await db.from("operation_state").select("*").eq("id",1).maybeSingle();
  if(error||!state||state.status!=="active"||!state.scheduler_armed)return {status:"inactive"};

  const {data:busy}=await db
    .from("guests")
    .select("id")
    .in("status",["reserved","hijacked"])
    .eq("completed",false)
    .limit(1);
  if(busy?.length)return {status:"waiting"};

  const now=Date.now();

  if(!state.first_call_done){
    const firstAt=state.first_call_at?new Date(state.first_call_at).getTime():0;
    if(!force && (!firstAt||now<firstAt))return {status:"armed"};

    const guest=await reserveRandomGuest();
    if(!guest)return {status:"no-guests"};

    await db.from("operation_state").update({
      first_call_done:true,
      next_call_at:null,
      updated_at:new Date().toISOString()
    }).eq("id",1);

    await sendHostPush();
    return {status:"sent",guest:guest.name};
  }

  const {data:eligible}=await db
    .from("guests")
    .select("id")
    .eq("status","available")
    .eq("completed",false);

  const count=eligible?.length||0;
  if(count===0)return {status:"complete"};

  if(force){
    const guest=await reserveRandomGuest();
    if(!guest)return {status:"no-guests"};
    await db.from("operation_state").update({next_call_at:null,updated_at:new Date().toISOString()}).eq("id",1);
    await sendHostPush();
    return {status:"sent",guest:guest.name};
  }

  if(!state.next_call_at){
    const cutoff=state.last_call_at?new Date(state.last_call_at).getTime():(now+60*60*1000);
    const remaining=Math.max(0,cutoff-now);
    const base=remaining/Math.max(1,count);
    const bounded=Math.max(7*60000,Math.min(22*60000,base));
    const jitter=.82+Math.random()*.36;
    const next=new Date(now+Math.round(bounded*jitter)).toISOString();
    await db.from("operation_state").update({next_call_at:next,updated_at:new Date().toISOString()}).eq("id",1);
    return {status:"scheduled",next};
  }

  const nextAt=new Date(state.next_call_at).getTime();
  if(now<nextAt)return {status:"scheduled",next:state.next_call_at};

  const guest=await reserveRandomGuest();
  if(!guest)return {status:"no-guests"};
  await db.from("operation_state").update({next_call_at:null,updated_at:new Date().toISOString()}).eq("id",1);
  await sendHostPush();
  return {status:"sent",guest:guest.name};
}

Deno.serve(async req=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:{
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"
  }});

  const body=await req.json().catch(()=>({}));
  let result;

  if(body.mode==="test"){
    result={status:"test",sent:await sendHostPush()};
  }else if(body.mode==="force"){
    result=await schedulerTick(true);
  }else{
    result=await schedulerTick(false);
  }

  return new Response(JSON.stringify(result),{
    headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}
  });
});
