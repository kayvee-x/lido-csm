import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export function InfoTooltip({ content }) {
  return (
    <div className="relative inline-block group ml-2">
      <InformationCircleIcon className="h-5 w-5 text-gray-400" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-sm rounded-lg">
        {content}
      </div>
    </div>
  );
}
