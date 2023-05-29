import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
    #database = {};

    constructor() {
        fs
            .readFile(databasePath, 'utf-8')
            .then(data => {
                this.#database = JSON.parse(data);
            })
            .catch(() => {
                this.#persist();
            });
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    select(table, parameters) {
        let data = this.#database[table] ?? [];

        if (parameters) {
            const {
                title,
                description,
                id
            } = parameters;

            data = data.filter(row => {
                if (id)
                    return row.id === id;
                else if (title && description)
                    return row
                            .title
                            .toLowerCase()
                            .indexOf(
                                title.toLowerCase()) >= 0 &&
                        row
                            .description
                            .toLowerCase()
                            .indexOf(description.toLowerCase()) >= 0;
                else if (title && !description)
                    return row
                        .title
                        .toLowerCase()
                        .indexOf(title.toLowerCase()) >= 0;
                else if (!title && description)
                    return row
                        .description
                        .toLowerCase()
                        .indexOf(description.toLowerCase()) >= 0;
                else
                    return row;
            });
        }

        return data;
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table]))
            this.#database[table].push(data);
        else
            this.#database[table] = [data];

        this.#persist();

        return data;
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex(r => r.id === id);

        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1);
            this.#persist();
        }
    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex(r => r.id === id);

        if (rowIndex > -1) {
            const { title, description } = data;

            if (title)
                this.#database[table][rowIndex].title = title;

            if (description)
                this.#database[table][rowIndex].description = description;

            this.#persist();
        }
    }

    updateSingleField(table, id) {
        const rowIndex = this.#database[table].findIndex(r => r.id === id);

        if (rowIndex > -1) {
            const { completed_at } = this.#database[table][rowIndex];

            this.#database[table][rowIndex].completed_at = completed_at ? null : new Date();

            this.#persist();
        }
    }
}