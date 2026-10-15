"use client";

import { memo } from "react";
import Buildings from "./Building";
import RoadNetwork from "./RoadNetwork";
import StreetProps from "./StreetProps";
import Vegetation from "./Vegetation";
import Vehicles from "./Vehicles";

/** Everything static in the city. Memoised so gameplay state never re-renders it. */
function CityEnvironmentImpl() {
  return (
    <>
      <RoadNetwork />
      <Buildings />
      <Vegetation />
      <StreetProps />
      <Vehicles />
    </>
  );
}

export default memo(CityEnvironmentImpl);
