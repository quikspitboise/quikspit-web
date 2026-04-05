{
  description = "QuikSpit development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems =
        f:
        nixpkgs.lib.genAttrs systems (
          system:
          f (
            import nixpkgs {
              inherit system;
            }
          )
        );
    in
    {
      devShells = forAllSystems (
        pkgs:
        let
          lib = pkgs.lib;
          postgres = pkgs.postgresql_16;
          runtimeLibs = [
            pkgs.libpq
            pkgs.openssl
          ]
          ++ lib.optionals pkgs.stdenv.isDarwin [ pkgs.libiconv ];
        in
        {
          default = pkgs.mkShell (
            {
              packages = [
                pkgs.nodejs_22
                pkgs.pnpm_9
                postgres
                pkgs.libpq
                pkgs.openssl
                pkgs.pkg-config
                pkgs.python3
                pkgs.gnumake
                pkgs.git
              ]
              ++ lib.optionals pkgs.stdenv.isDarwin [ pkgs.libiconv ];

              LD_LIBRARY_PATH = lib.makeLibraryPath runtimeLibs;

              shellHook = ''
                export PNPM_HOME="$PWD/.pnpm-home"
                export PATH="$PNPM_HOME:$PATH"
                export npm_config_python="${pkgs.python3}/bin/python3"

                export PGHOST="$PGDATA/tmp"
                export PGPORT="''${PGPORT:-5432}"
                export PGDATA="$PWD/.nix-postgres"

                pg-init() {
                  if [ ! -f "$PGDATA/PG_VERSION" ]; then
                    mkdir -p "$PGDATA"
                    initdb -D "$PGDATA" --username=postgres --auth=trust >/dev/null
                  fi
                }

                pg-start() {
                  mkdir -p "$PGDATA/tmp"
                  pg-init
                  pg_ctl -D "$PGDATA" -l "$PGDATA/postgres.log" -o "-p $PGPORT -k $PGDATA/tmp" start
                }

                pg-stop() {
                  if [ -f "$PGDATA/PG_VERSION" ]; then
                    pg_ctl -D "$PGDATA" stop
                  fi
                }

                echo "QuikSpit dev shell"
                echo "  node: $(node --version)"
                echo "  pnpm: $(pnpm --version)"
                echo "  postgres: $(psql --version | awk '{print $3}')"
                echo "  helpers: pg-init, pg-start, pg-stop"
                echo "  next: pnpm install && pnpm dev"
              '';
            }
            // lib.optionalAttrs pkgs.stdenv.isDarwin {
              DYLD_LIBRARY_PATH = lib.makeLibraryPath runtimeLibs;
            }
          );
        }
      );
    };
}
