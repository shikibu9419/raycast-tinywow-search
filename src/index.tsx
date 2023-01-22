import { ActionPanel, Action, List, environment } from "@raycast/api";
import { useCallback } from "react";
import { updateTools } from "./update-tools";

import tools from "../assets/tools.json";

const updateItem = (
  <List.Item
    key={0}
    title="UPDATE TOOLS"
    subtitle="Scrape tinywow.com/tools and update tools"
    keywords={["update"]}
    actions={
      <ActionPanel>
        <Action
          title="Scrape tinywow.com/tools and update tools"
          onAction={() => updateTools(environment.assetsPath)}
        />
      </ActionPanel>
    }
  />
);

export default function Command() {
  const getToolList = useCallback(
    () =>
      tools
        .map((tool, index) => (
          <List.Item
            key={index + 1}
            title={tool.title}
            subtitle={tool.subtitle}
            keywords={tool.keywords.split(" ")}
            icon={{ source: tool.icon }}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={tool.url} />
              </ActionPanel>
            }
          />
        ))
        .concat(updateItem),
    []
  );

  return <List>{getToolList()}</List>;
}
