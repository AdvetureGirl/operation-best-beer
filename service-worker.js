
self.addEventListener("push",event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch(_){}
  const title=data.title||"GRU PRIORITY TRANSMISSION";
  const options={
    body:data.body||"Scarlet Overkill is attempting to contact you.",
    data:{url:data.url||"./?scarlet_push=1"}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const url=event.notification.data?.url||"./?scarlet_push=1";
  event.waitUntil(
    clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
      for(const client of list){
        if("focus" in client){
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow?clients.openWindow(url):undefined;
    })
  );
});
