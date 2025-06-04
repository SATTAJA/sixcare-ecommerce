import Carousel from "@/components/Carousel";
import Header from "../components/Header";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";




export default function Home() {
  const images = [
    '/welcome.png',
    '/info.png',
    '/ucapan.png'
  ]
  return (
    <main>
      <Header/>
      <Carousel images={images}/>
      <div>
        <Card/>
      </div>
      <ChatWidget/>
      <Footer/>
    </main>
  );
}
