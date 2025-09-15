import { faStar, faStarHalf } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
const TOTAL_STAR_RATING = 5;
const RatingComponent = ({
  rating,
  totalRating = TOTAL_STAR_RATING,
  reviews,
}) => {
  return (
    <div className="flex items center">
      {[...Array(totalRating)]?.map((_, idx) => {
        let number = idx + 0.5;
        return (
          <>
            {rating >= idx + 1 ? (
              <FontAwesomeIcon className="rating-icon" icon={faStar} />
            ) : rating >= number ? (
              <FontAwesomeIcon className="rating-icon" icon={faStarHalf} />
            ) : (
              <FontAwesomeIcon className="rating-icon" icon={faStarRegular} /> 
            )}
          </>
        );
      })}
      <div className="reviews">{`(${reviews}) reviews`}</div>
    </div>
  );
};

export default RatingComponent;
