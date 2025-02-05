export const clientFunctionsGenerated = `
function process(response: AxiosResponse) {
    try {
      const res = JSON.parse(response.data);
      return Promise.resolve(res);
    } catch (e) {
      return Promise.resolve(response.data);
    }
  }
  
  function objectToFormData(obj: { [key: string]: any }, rootName?: string) {
    const formData = new FormData();
    function appendFormData(data: { [key: string]: any } | any, root?: string) {
      root = root || "";
      if (root.includes("_")) {
        const roots = root.split("_");
        root = roots.map((r) => toUpperCamelCase(r)).join(".");
      }
  
      if (isFile(data)) {
        if (data instanceof File) {
          formData.append(root, data, data.name);
        }
        if ("data" in data && data.data instanceof File) {
          formData.append(root, data.data, data.data.name);
        }
      } else if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          if (isFile(data[i])) {
            appendFormData(data[i], root);
          } else {
            appendFormData(data[i], \`\${root}[\${i}]\`);
          }
        }
      } else if (typeof data === "object" && data) {
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            if (root === "") {
              appendFormData(data[key], toUpperCamelCase(key));
            } else {
              appendFormData(
                data[key],
                \`\${toUpperCamelCase(root)}.\${toUpperCamelCase(key)}\`
              );
            }
          }
        }
      } else {
        if (data != null) {
          formData.append(root, data.toString());
        }
      }
    }
  
    appendFormData(obj, rootName);
  
    return formData;
  }
  
  function toUpperCamelCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  function isFile(data: any) {
    if (!data) return false;
    if (typeof data !== "object") return false;
  
    return data instanceof File || ("data" in data && data.data instanceof File);
  }
  
  function addQueryParamsToUrl(url: string, params: any) {
    const url_ = new URL(url);
  
    function addParam(key: string, value: any) {
      if (value == undefined) return;
  
      if (key.includes("_")) {
        const [key1, key2] = key.split("_");
        key = \`\${toUpperCamelCase(key1)}.\${toUpperCamelCase(key2)}\`;
      }
  
      if (Array.isArray(value)) {
        value.forEach((item) => addParam(key, item));
      } else if (typeof value === "object") {
        for (const [subKey, subValue] of Object.entries(value)) {
          addParam(\`\${key}.\${subKey}\`, subValue);
        }
      } else {
        url_.searchParams.append(toUpperCamelCase(key), value.toString());
      }
    }
  
    if (params == undefined) return url_.toString();
  
    for (const [key, value] of Object.entries(params)) {
      addParam(key, value);
    }
  
    return url_.toString();
  }
`