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
    nextArrow: <CustomNextArrow />, // Flecha personalizada para "next"
    prevArrow: <CustomPrevArrow />, // Flecha personalizada para "prev"
  };

  return (
    <div className="text-white">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative outline-none">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-[500px] md:h-[400px] sm:h-[300px] object-cover" // Altura responsiva
            />
            <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center">
              <h2 className="text-4xl md:text-3xl sm:text-2xl font-bold text-center">
                {banner.title}
              </h2>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

// Componentes personalizados para las flechas
const CustomNextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <button
      className={className}
      style={{ ...style, display: "block", right: "10px", zIndex: 10 }}
      onClick={onClick}
    >
      →
    </button>
  );
};

const CustomPrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <button
      className={className}
      style={{ ...style, display: "block", left: "10px", zIndex: 10 }}
      onClick={onClick}
    >
      ←
    </button>
  );
}

export default BannerSlider;