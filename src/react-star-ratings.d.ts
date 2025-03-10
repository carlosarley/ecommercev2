declare module "react-star-ratings" {
    import React from "react";
  
    interface StarRatingsProps {
      rating: number;
      starRatedColor?: string;
      starEmptyColor?: string;
      numberOfStars?: number;
      starDimension?: string;
      starSpacing?: string;
      name?: string;
      changeRating?: (newRating: number) => void;
      readonly?: boolean;
    }
  
    const StarRatings: React.FC<StarRatingsProps>;
  
    export default StarRatings;
  }