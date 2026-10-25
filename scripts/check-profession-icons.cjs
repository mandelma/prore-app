const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const professionDir = path.join(root, "server/data/professions");

const cssPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(root, "node_modules/mdb-vue-ui-kit/css/mdb.min.css");

if (!fs.existsSync(cssPath)) {
    console.error("CSS puudub:", cssPath);
    process.exit(1);
}

if (!fs.existsSync(professionDir)) {
    console.error("Ametite kaust puudub:", professionDir);
    process.exit(1);
}

const css = fs.readFileSync(cssPath, "utf8");

const files = fs.readdirSync(professionDir)
    .filter(file => file.endsWith(".json"));

const results = [];

for (const file of files) {
    try {
        const item = JSON.parse(
            fs.readFileSync(path.join(professionDir, file), "utf8")
        );

        const cls = (item.icon || "")
            .split(/\s+/)
            .find(c =>
                /^fa-/.test(c) &&
                ![
                    "fa-solid",
                    "fa-regular",
                    "fa-brands",
                    "fa-fw"
                ].includes(c)
            );

        if (!cls) {
            results.push({
                amet: item.code || file,
                ikoon: item.icon || "(puudub)",
                tulemus: "IKOON PUUDUB"
            });
            continue;
        }

        // Otsime CSS-ist täpset ikooniklassi
        const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(
            "\\." + escaped + "(?=::?before|\\s*[,\\{])"
        );

        const found = regex.test(css);

        results.push({
            amet: item.code || file,
            ikoon: item.icon,
            tulemus: found ? "OK" : "CSS-REEGEL PUUDUB"
        });

    } catch (e) {
        results.push({
            amet: file,
            ikoon: "-",
            tulemus: "JSON VIGA: " + e.message
        });
    }
}

console.log("\nCSS:", cssPath);
console.log("Ameteid:", files.length);

console.table(results);

const problems = results.filter(r => r.tulemus !== "OK");

console.log("\nKontrollitud:", results.length);
console.log("Korras:", results.length - problems.length);
console.log("Probleemseid:", problems.length);

console.log(
    "\nNB: CSS-reegli olemasolu ei tõesta fondifaili glüüfi olemasolu."
);

// node scripts/check-profession-icons.cjs scripts/fontawesome-6.0.0.min.css