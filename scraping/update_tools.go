package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/canhlinh/svg2png"
	"github.com/sirupsen/logrus"
)

const ICON_URL = "https://tinywow.com/v3/img/menu-icons.svg"
const SVG_ICON_TEMPLATE = `<html>
	<head><link rel="stylesheet" href="%s" type="text/css"></head>
	<body>%s%s</body>
	</html>
	`

type Tool struct {
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Keywords    string `json:"keywords"`
	Url         string `json:"url"`
	IconPath    string `json:"icon"`
	IconContent string `json:"-"`
}

func getTools(doc goquery.Document) []Tool {
	var items []Tool
	doc.Find("div.element-tools").Each(func(index int, selection *goquery.Selection) {
		title, _ := selection.Attr("data-title")
		subtitle, _ := selection.Attr("data-description")
		keywords, _ := selection.Attr("data-search-terms")
		url, _ := selection.Find("a").First().Attr("href")

		iconContent, _ := selection.Find(".icon_box").First().Parent().Html()
		iconContent = strings.Replace(iconContent, "xlink:href=\""+ICON_URL, "href=\"", -1)

		href, _ := selection.Find("use").First().Attr("href")
		iconPath := "icons/" + strings.Split(href, "#")[1] + ".png"

		items = append(items, Tool{
			Title:       title,
			Subtitle:    subtitle,
			Keywords:    keywords,
			Url:         url,
			IconPath:    iconPath,
			IconContent: iconContent,
		})
	})

	return items
}

func main() {
	doc, _ := goquery.NewDocument("https://tinywow.com/tools")

	// get tools from tinywow.com/tools and write JSON
	items := getTools(*doc)
	data, err := json.Marshal(items)
	if err != nil {
		panic(err)
	}

	encoder := json.NewEncoder(os.Stdout)
	encoder.SetEscapeHTML(false)
	encoder.Encode(data)

	var buf bytes.Buffer
	err = json.Indent(&buf, data, "", "  ")
	if err != nil {
		panic(err)
	}
	indentJson := buf.String()

	f, err := os.Create("assets/tools.json")
	f.WriteString(indentJson)

	// get tools from tinywow.com/tools and write JSON
	fmt.Println("Creating thumnails...")
	styleText, _ := doc.Find("style").First().Html()
	stylesheet, err := ioutil.TempFile(os.TempDir(), "style*.css")
	if err != nil {
		log.Fatal(err)
	}
	_, err = stylesheet.Write([]byte(styleText))

	res, err := http.Get(ICON_URL)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Body.Close()
	iconTemplateByte, _ := io.ReadAll(res.Body)
	iconTemplate := string(iconTemplateByte)

	chrome := svg2png.NewChrome().SetHeight(48).SetWith(48)

	for _, item := range items {
		// create svg file
		temp_file, err := ioutil.TempFile(os.TempDir(), "icon*.html")
		if err != nil {
			log.Fatal(err)
		}

		content := fmt.Sprintf(SVG_ICON_TEMPLATE, stylesheet.Name(), iconTemplate, item.IconContent)
		_, err = temp_file.Write([]byte(content))
		if err != nil {
			log.Fatal(err)
		}

		if err := chrome.Screenshoot("file://"+temp_file.Name(), "assets/"+item.IconPath); err != nil {
			logrus.Panic(err)
		}
		os.Remove(temp_file.Name())

		fmt.Println(item.Title)
	}
}
