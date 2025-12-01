import { InventoryDumpFnT, RestFnT, ObjectiveFnT, HeadingFnT, HomeShoppingFnT } from "../types";

export type AdventureStateConfig = {
    name: string;
    inventoryDumpFn: InventoryDumpFnT;
    restFn: RestFnT;
    objectiveFn: ObjectiveFnT;
    headingFn: HeadingFnT;
    homeShoppingFn?: HomeShoppingFnT;
};
