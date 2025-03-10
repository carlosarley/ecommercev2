import Slider from "react-slick";

interface Banner {
  id: number;
  image: string;
  title: string;
}

const BannerSlider: React.FC = () => {
  const banners: Banner[] = [
    { id: 1, image: "banner1.jpg", title: "¡Oferta Especial! 35% OFF" },
    { id: 2, image: "banner2.jpg", title: "Nuevos Lanzamientos" },
    { id: 3, image: "banner3.jpg", title: "Envíos Gratis Hoy" },
    { id: 4, image: "banner4.jpg", title: "Descuentos Exclusivos" },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="bg-body text-white">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative outline-none">
            <img src={banner.image} alt={banner.title} className="w-full h-[500px] object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h2 className="text-4xl font-bold text-white">{banner.title}</h2>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BannerSlider;