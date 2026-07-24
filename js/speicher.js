function speichereEffektStatus(effekte){
 localStorage.setItem("pf-effekte",JSON.stringify(effekte.map(e=>({id:e.id,aktiv:e.aktiv}))));
}

function ladeEffektStatus(effekte){
 const daten=localStorage.getItem("pf-effekte");
 if(!daten) return;
 const status=JSON.parse(daten);
 status.forEach(s=>{
   const e=effekte.find(x=>x.id===s.id);
   if(e) e.aktiv=s.aktiv;
 });
}
