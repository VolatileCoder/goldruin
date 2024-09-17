package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"strings"
)

func folderExists(path string) bool {
	if _, err := os.Stat(path); err == nil {
		return true
	} else if os.IsNotExist(err) {
		return false
	} else {
		fmt.Println("Error:", err)
		return false
	}
}

type Compiler struct {
	Contents   map[string]string
	FinalOrder []string
}

func (c *Compiler) Reorder() {
	for file, _ := range c.Contents {
		c.processFile(file)
	}
}

func indexOf(arr []string, target string) int {
	for i, val := range arr {
		if val == target {
			return i // Found the target, return its index
		}
	}
	return -1 // Target not found
}

func (c *Compiler) processFile(file string) {
	if indexOf(c.FinalOrder, file) == -1 {
		lines := strings.Split(c.Contents[file], "\n")
		for _, line := range lines {
			if strings.HasPrefix(strings.TrimSpace(line), `//REQUIRES`) {
				l := strings.ReplaceAll(line, `//REQUIRES`, "")
				l = strings.ReplaceAll(l, ",", " ")
				l = strings.ReplaceAll(l, "  ", " ")
				for _, dependency := range strings.Split(l, " ") {
					d := strings.TrimSpace(dependency)
					if len(d) > 0 {
						c.processFile(d)
					}
				}
			}
		}
		c.FinalOrder = append(c.FinalOrder, file)
	}
}
func processFolder(dir string) {

	var p Compiler
	p.Contents = make(map[string]string)

	items, _ := ioutil.ReadDir(dir)
	for _, item := range items {
		if !item.IsDir() && path.Ext(item.Name()) == ".js" {
			data, _ := os.ReadFile(path.Join(dir, item.Name()))

			contents := strings.TrimSpace(string(data))           // Remove leading/trailing whitespace
			contents = strings.ReplaceAll(contents, "\uFEFF", "") // Remove BOM if present

			p.Contents[string(item.Name()[:len(item.Name())-3])] = contents
		}
	}
	p.Reorder()

	file, _ := os.Create(dir + ".js")
	defer file.Close()

	for _, path := range p.FinalOrder {
		fmt.Println(path)
		lines := strings.Split(p.Contents[path], "\n")
		for _, line := range lines {
			if !strings.Contains(line, "//REQUIRES") {
				fmt.Fprintln(file, line)
			}
		}
	}
}

func main() {
	dirs := os.Args[1:]
	for _, dir := range dirs {
		if folderExists(dir) {
			processFolder(dir)
		}
	}
}
