import DOMParser from "dom-parser";
import fetch from "node-fetch";

interface Tool {
  title: string;
  subtitle: string;
  keywords: string[];
  url: string;
  icon: string;
}

const parser = new DOMParser();
export const getDOM = async (url: string) => parser.parseFromString(await fetch(url).then((res) => res.text()));

export const getTinyWowTools = (dom: DOMParser.Dom): Tool[] => {
  const elementTools = dom.getElementsByClassName("element-tools") || [];

  return elementTools.map((elem) => {
    const svgTag = elem.getElementsByTagName("svg");
    const linkTag = elem.getElementsByTagName("a");

    const iconUrl = svgTag?.[0].outerHTML.match(/\bhttps?:\/\/\S+"/gi)?.[0]?.slice(0, -1);
    const icon = `icons/${iconUrl?.split("#")[1]}.png`;

    return {
      title: elem.getAttribute("data-title") || "",
      subtitle: elem.getAttribute("data-description") || "",
      keywords: elem.getAttribute("data-search-terms")?.split(" ") || [],
      url: linkTag?.[0].getAttribute("href") || "",
      icon,
    };
  });
};