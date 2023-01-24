import { ActionPanel, Action, List, environment } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";

import { writeFile } from "fs";

import cachedTools from "../assets/tools.json";
import { getDOM, getTinyWowTools } from "./get-tools";

export default function Command() {
  const { isLoading, data, error, revalidate } = useCachedPromise(
    async () => {
      const dom = await getDOM("https://tinywow.com/tools");
      return getTinyWowTools(dom);
    },
    [],
    {
      initialData: cachedTools,
      onData: (data) => {
        writeFile(`${environment.assetsPath}/tools.json`, JSON.stringify(data, null, 2), (err) => {
          if (err) console.error(err);
        });
      },
    }
  );

  return (
    <List isLoading={isLoading}>
      {(!error ? data : cachedTools).map((tool, index) => (
        <List.Item
          key={index + 1}
          title={tool.title}
          subtitle={tool.subtitle}
          keywords={tool.keywords}
          icon={{ source: tool.icon }}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={tool.url} />
              <Action title="Reload" onAction={revalidate} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
