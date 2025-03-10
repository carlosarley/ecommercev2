import BannerSlider from "../components/BannerSlider";
import RecentlyViewed from "../components/RecentlyViewed";
import ProductList from "../components/ProductList";
import OffersSlider from "../components/OffersSlider";
import TopSellingSlider from "../components/TopSellingSlider";

const Home: React.FC = () => {
  return (
    <div className="container mx-auto">
      <BannerSlider />
      <RecentlyViewed />
      <OffersSlider />
      <TopSellingSlider />      
      <ProductList />
    </div>
  );
};

export default Home;