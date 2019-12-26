import { createDrivestreamFileType } from "./util/createDrivestreamFile"
import { Config } from "../config/config"

export const createConfig = async () => {
    const config: Config = {
        metadata: {}
    }

    const driveFile = await createDrivestreamFileType({ name: 'config', type: 'config', body: JSON.stringify(config) })
}