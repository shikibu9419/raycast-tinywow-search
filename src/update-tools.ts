import { showToast, Toast } from "@raycast/api";
import { writeFile } from "fs";
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
const getDOM = async (url: string) => parser.parseFromString(await fetch(url).then((res) => res.text()));

const getTinyWowTools = (dom: DOMParser.Dom): Tool[] => {
  const tools: Tool[] = [];

  const elems = dom.getElementsByClassName("element-tools") || [];
  for (const elem of elems) {
    const iconBoxTag = elem.getElementsByClassName("icon_box");
    const svgTag = elem.getElementsByTagName("svg");
    const linkTag = elem.getElementsByTagName("a");

    if (!iconBoxTag || !svgTag || !linkTag) continue;

    const iconUrl = svgTag[0].outerHTML.match(/\bhttps?:\/\/\S+"/gi)?.[0]?.slice(0, -1);
    const icon = `icons/${iconUrl?.split("#")[1]}.png`;

    tools.push({
      title: elem.getAttribute("data-title") || "",
      subtitle: elem.getAttribute("data-description") || "",
      keywords: elem.getAttribute("data-search-terms")?.split(" ") || [],
      url: linkTag[0].getAttribute("href") || "",
      icon,
    });
  }

  return tools;
};

export const updateTools = async (assetsPath: string) => {
  await showToast({
    style: Toast.Style.Animated,
    title: "Updating tools",
  });
  const dom = await getDOM("https://tinywow.com/tools");

  const tools = getTinyWowTools(dom);

  writeFile(`${assetsPath}/tools.json`, JSON.stringify(tools), (err) => console.error(err));

  await showToast({
    style: Toast.Style.Success,
    title: "Updated!",
  });
};
