package docs

import "github.com/swaggo/swag"

type s struct{}

func (s *s) ReadDoc() string {
	return `{"swagger":"2.0","info":{"title":"WMS Order API","version":"1.0"}}`
}

func init() {
	swag.Register(swag.Name, &s{})
}
