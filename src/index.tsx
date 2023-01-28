import { ActionPanel, Action, List, environment } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { existsSync, readFileSync, writeFile } from "fs";

import { getTinyWowTools, Tool } from "./tool";

const toolsPath = `${environment.supportPath}/tools.json`;
const initialData: Tool[] = [];
if (existsSync(toolsPath)) {
  initialData.push(...JSON.parse(readFileSync(toolsPath, { encoding: "utf-8" })));
}

export default function Command() {
  const { isLoading, data, revalidate } = useCachedPromise(getTinyWowTools, [], {
    initialData,
    onData: (data) => {
      writeFile(toolsPath, JSON.stringify(data, null, 2), (err) => {
        if (err) console.error(err);
      });
      initialData.splice(0, initialData.length, ...data);
    },
  });

  return (
    <List isLoading={isLoading}>
      {data.map((tool, index) => (
        <List.Item
          key={index}
          title={tool.title}
          subtitle={tool.subtitle}
          keywords={tool.keywords.concat(tool.subtitle.split(" "))}
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
