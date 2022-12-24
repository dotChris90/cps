
export class ConanPackage {
    
    name = "";

    version = "";

    url = "";

    homepage = "";

    license = "";

    author = "";

    description = "";

    topics : string[] = [];

    generators : string[] = [];

    exports : string[] = [];

    exports_sources : string[] = [];

    short_paths = false;

    apply_env = false;

    build_policy = "";

    revision_mode = "hash";

    options : Map<string, string[]> = new Map<string,string[]>();

    default_options : Map<string,string> = new Map<string,string>();

    deprecated = "";

    deepRequires : Set<string> = new Set<string>();

    public constructor(init?: Partial<ConanPackage>) {
        Object.assign(this, init);
    }
}