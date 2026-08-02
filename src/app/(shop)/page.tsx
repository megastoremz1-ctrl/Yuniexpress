import { prisma } from "@/lib/db";
import HomePageClient from "./HomePageClient";

export const dynamic = "force-dynamic";


function smartProductSelection(products:any[], limit=24){

  const groups:any = {};

  products.forEach(product=>{

    const category =
      product.category?.id || "other";

    if(!groups[category]){
      groups[category] = [];
    }

    groups[category].push(product);

  });


  const result:any[]=[];


  while(result.length < limit){

    const categories = Object.keys(groups)
      .sort(()=>Math.random()-0.5);


    for(const cat of categories){

      const list = groups[cat];


      if(list.length){

        const index =
          Math.floor(Math.random()*list.length);


        const product =
          list.splice(index,1)[0];


        if(!result.some(p=>p.id===product.id)){
          result.push(product);
        }

      }


      if(result.length >= limit)
        break;

    }


    if(result.length >= products.length)
      break;

  }


  return result.sort(
    ()=>Math.random()-0.5
  );

}



async function getHomeData(){

try{


const products =
await prisma.product.findMany({

where:{
 status:"APPROVED"
},

take:80,


select:{

id:true,
title:true,
slug:true,

priceMZN:true,
originalPriceMZN:true,

rating:true,
reviewCount:true,

sold:true,
freeShipping:true,


category:{
 select:{
  id:true,
  name:true
 }
},


images:{
 take:1,
 select:{
  url:true,
  alt:true
 }
}


},


orderBy:{
 sold:"desc"
}


});



const banners =
await prisma.banner.findMany({

where:{
 active:true
},

take:5,

orderBy:{
 order:"asc"
},

select:{
 id:true,
 title:true,
 subtitle:true,
 image:true,
 link:true
}

});




const categories =
await prisma.category.findMany({

where:{
 featured:true
},

take:12,

orderBy:{
 order:"asc"
},

select:{
 id:true,
 name:true,
 slug:true,
 icon:true,
 image:true
}

});




const settings =
await prisma.setting.findMany();


const settingsMap:any={};


settings.forEach(s=>{
 settingsMap[s.key]=s.value;
});



function mapProduct(p:any){

return {

id:p.id,

title:
p.title?.length>80
?p.title.substring(0,80)+"..."
:p.title,


slug:p.slug,


priceMZN:p.priceMZN,
originalPriceMZN:p.originalPriceMZN,


rating:p.rating,
reviewCount:p.reviewCount,


sold:p.sold,
freeShipping:p.freeShipping,


category:p.category,


images:p.images

};


}



const mapped =
products.map(mapProduct);



const selected =
smartProductSelection(mapped,24);



return {


banners,


featuredProducts:selected.slice(0,12),


newProducts:selected.slice(12,24),


categories,


settings:settingsMap


};



}catch(error){


console.log(error);


return {

banners:[],
featuredProducts:[],
newProducts:[],
categories:[],
settings:{}

};


}


}



export default async function HomePage(){

const data =
await getHomeData();


return (

<HomePageClient {...data}/>

);


}
