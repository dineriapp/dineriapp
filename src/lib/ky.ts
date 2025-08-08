import ky from "ky";

const kyInstance = ky.create({
    timeout: 30000, // 30 seconds
    parseJson: (text) =>
        JSON.parse(text, (key, value) => {
            if (key.endsWith("At")) return new Date(value);
            return value;
        }),
});

export default kyInstance;
