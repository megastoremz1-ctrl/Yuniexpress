"use client";

import { useState } from "react";
import Link from "next/link";

import HeroBanner from "@/components/home/HeroBanner";
import ProductCard from "@/components/product/ProductCard";

import {
  BannerData,
  ProductCard as ProductCardType,
  CategoryData,
} from "@/types";

import {
  Zap,
  Truck,
  Shield,
  HeadphonesIcon,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Gamepad2,
  Car,
  Watch,
  Monitor,
  ShoppingBag,
  Baby,
  Wrench,
  Lightbulb,
  BookOpen,
  Footprints,
  PawPrint,
  ChevronRight,
  Flame,
  Clock,
  Star,
} from "lucide-react";


const categoryIcons: Record<string, any> = {

  Monitor,
  Smartphone,
  Laptop: Monitor,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Gamepad2,
  Car,
  Watch,
  ShoppingBag,
  Footprints,
  Baby,
  Wrench,
  Lightbulb,
  BookOpen,
  PawPrint,
  Shield,

};



interface HomePageClientProps {

  banners: BannerData[];

  featuredProducts: ProductCardType[];

  newProducts: ProductCardType[];

  categories: CategoryData[];

  settings: Record<string,string>;

}



export default function HomePageClient({

banners,

featuredProducts,

newProducts,

categories,

settings,

}:HomePageClientProps){


const [activeTab,setActiveTab] =
useState<
"featured"|"new"|"recommended"
>("featured");



const products =
activeTab==="featured"
?
featuredProducts
:
activeTab==="new"
?
newProducts
:
newProducts;



return (

<div>


<div className="container mx-auto px-3 pt-2">


<div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-2">


<aside

className="
hidden lg:block
bg-white
rounded-lg
border
overflow-hidden
"

style={{
aspectRatio:"200/350"
}}

>


<div className="p-2.5 bg-gray-900 text-white text-xs font-semibold">

Categorias

</div>


<nav
className="overflow-y-auto"
style={{
maxHeight:"calc(100% - 36px)"
}}
>


{categories.slice(0,10).map((cat)=>{


const IconComp =
categoryIcons[cat.icon || ""]
||
ShoppingBag;



return (

<Link

key={cat.id}

href={`/category/${cat.slug}`}

className="
flex items-center gap-2
px-3 py-2
text-xs text-gray-700
hover:bg-yellow-50
"

>


<IconComp size={14}/>


<span className="truncate">

{cat.name}

</span>


</Link>


);


})}



<Link

href="/categories"

className="
block px-3 py-2
text-xs text-yellow-600
"

>

Ver todas →

</Link>


</nav>


</aside>




<div>

<HeroBanner banners={banners}/>

</div>


</div>

</div>





<div className="container mx-auto px-3">


<div className="grid grid-cols-4 gap-2 py-3">


<div className="flex items-center gap-2 p-2 bg-white rounded-lg border">

<Truck size={16}/>

<span className="text-[10px]">

Frete Grátis

</span>

</div>



<div className="flex items-center gap-2 p-2 bg-white rounded-lg border">

<Shield size={16}/>

<span className="text-[10px]">

Pagamento Seguro

</span>

</div>



<div className="flex items-center gap-2 p-2 bg-white rounded-lg border">

<Zap size={16}/>

<span className="text-[10px]">

Preços MT

</span>

</div>



<div className="flex items-center gap-2 p-2 bg-white rounded-lg border">

<HeadphonesIcon size={16}/>

<span className="text-[10px]">

Suporte

</span>

</div>


</div>
  {/* Mobile Categories */}

<div className="lg:hidden overflow-x-auto pb-4 no-scrollbar">

  <div className="flex gap-4 min-w-max">

    {categories.slice(0,12).map((cat)=>{

      const IconComp =
      categoryIcons[cat.icon || ""]
      ||
      ShoppingBag;


      return (

      <Link

      key={cat.id}

      href={`/category/${cat.slug}`}

      className="
      flex flex-col
      items-center
      gap-1.5
      w-16
      "

      >

        <div
        className="
        w-12 h-12
        bg-yellow-50
        rounded-2xl
        flex items-center
        justify-center
        "
        >

          <IconComp
          size={20}
          className="text-yellow-600"
          />

        </div>


        <span
        className="
        text-[10px]
        text-gray-700
        text-center
        "
        >

        {cat.name.split(" ")[0]}

        </span>


      </Link>

      );


    })}

  </div>

</div>




{/* Flash Deals */}

<div
className="
my-3
bg-gradient-to-r
from-red-500
via-orange-500
to-yellow-500
rounded-lg
p-3
text-white
"
>

<div className="flex items-center gap-3">


<div
className="
w-12 h-12
rounded-full
bg-white/20
flex items-center
justify-center
"
>

<Flame size={24}/>

</div>


<div>

<h2
className="
text-lg
font-bold
flex items-center
gap-2
"
>

Super Ofertas

<Clock size={16}/>

</h2>


<p className="text-sm text-white/80">

Descontos até 50%

</p>


</div>


</div>

</div>





{/* Tabs */}

<div className="mb-4">


<div className="flex border-b">


<button

onClick={()=>
setActiveTab("featured")
}

className={`
px-5 py-3
text-sm
font-medium
border-b-2

${
activeTab==="featured"

?

"border-yellow-500 text-yellow-600"

:

"border-transparent text-gray-500"

}

`}

>


<Star
size={14}
className="inline mr-1"
/>

Em Destaque


</button>





<button

onClick={()=>
setActiveTab("new")
}

className={`
px-5 py-3
text-sm
font-medium
border-b-2

${
activeTab==="new"

?

"border-yellow-500 text-yellow-600"

:

"border-transparent text-gray-500"

}

`}

>


<Zap
size={14}
className="inline mr-1"
/>

Novidades


</button>





<button

onClick={()=>
setActiveTab("recommended")
}

className={`
px-5 py-3
text-sm
font-medium
border-b-2

${
activeTab==="recommended"

?

"border-yellow-500 text-yellow-600"

:

"border-transparent text-gray-500"

}

`}

>


<HeadphonesIcon
size={14}
className="inline mr-1"
/>

Para Si


</button>


</div>


</div>





{/* Products */}

<div
className="
grid
grid-cols-2
sm:grid-cols-3
md:grid-cols-4
lg:grid-cols-5
xl:grid-cols-6
gap-2
"
>


{products.map((product)=>(

<ProductCard

key={product.id}

product={product}

/>

))}


</div>






{/* More Products */}

<div className="text-center py-5">


<Link

href={`/search?sort=${
activeTab==="new"
?
"newest"
:
"popular"
}`}

className="
inline-flex
items-center
gap-2
px-8
py-3
bg-white
border-2
border-yellow-500
text-yellow-600
rounded-full
font-medium
"

>


Ver mais produtos


<ChevronRight size={16}/>


</Link>


</div>





<NewsletterSection />



</div>


</div>


);

}





function NewsletterSection(){


const [email,setEmail]=useState("");

const [loading,setLoading]=useState(false);

const [message,setMessage]=useState("");



async function handleSubmit(
e:React.FormEvent
){

e.preventDefault();


if(!email)
return;


setLoading(true);


try{


const res =
await fetch(
"/api/newsletter",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:
JSON.stringify({
email
})

}

);



const data =
await res.json();


setMessage(
data.message ||
data.error ||
"Sucesso"
);



if(res.ok)
setEmail("");



}catch{


setMessage(
"Erro ao processar"
);



}finally{


setLoading(false);


}



}



return (

<div
className="
my-6
bg-yellow-50
rounded-xl
p-6
text-center
border
"
>


<h3
className="
text-xl
font-bold
mb-2
"
>

Receba ofertas exclusivas

</h3>


<p className="text-gray-600 text-sm mb-5">

Receba promoções e novidades

</p>




<form

onSubmit={handleSubmit}

className="
flex
max-w-md
mx-auto
gap-2
"

>


<input

type="email"

placeholder="Seu email..."

value={email}

onChange={
e=>setEmail(e.target.value)
}

required

className="
flex-1
px-4
py-3
rounded-full
border
text-sm
"

/>


<button

disabled={loading}

className="
bg-yellow-500
text-white
px-6
py-3
rounded-full
font-medium
"

>


{
loading
?
"..."
:
"Subscrever"
}


</button>


</form>




{
message &&

<p className="mt-3 text-sm text-green-700">

{message}

</p>

}



</div>


);


  }
