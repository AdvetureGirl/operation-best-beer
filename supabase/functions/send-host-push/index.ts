
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY=Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY=Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT=Deno.env.get("VAPID_SUBJECT")||"mailto:host@example.com";

webpush.setVapidDetails(VAPID_SUBJECT,VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY);

Deno.serve(async req=>{
  if(req.method==="OPTIONS"){
    return new Response("ok",{headers:{
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"
    }});
  }

  const body=await req.json().catch(()=>({}));
  const supabase=createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY);

  const {data,error}=await supabase
    .from("push_subscriptions")
    .select("id,subscription")
    .eq("is_host",true);

  if(error){
    return new Response(JSON.stringify({error:error.message}),{
      status:500,
      headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}
    });
  }

  const results=[];
  for(const row of data||[]){
    try{
      await webpush.sendNotification(
        row.subscription,
        JSON.stringify({
          title:body.title||"GRU PRIORITY TRANSMISSION",
          body:body.body||"Scarlet Overkill is attempting to contact you.",
          url:body.url||"./?scarlet_push=1"
        })
      );
      results.push({id:row.id,ok:true});
    }catch(err){
      results.push({id:row.id,ok:false,error:String(err)});
    }
  }

  return new Response(JSON.stringify({sent:results}),{
    headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}
  });
});
