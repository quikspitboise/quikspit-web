{
  description = "QuikSpit development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    # Nixpkgs 26.11 dropped Intel macOS; 26.05 still receives security fixes.
    nixpkgs-intel-darwin.url = "github:NixOS/nixpkgs/nixpkgs-26.05-darwin";
  };

  outputs =
    { nixpkgs, nixpkgs-intel-darwin, ... }:
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
            import (if system == "x86_64-darwin" then nixpkgs-intel-darwin else nixpkgs) {
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
          pnpm = pkgs.writeShellScriptBin "pnpm" ''
            exec ${pkgs.nodejs_22}/bin/corepack pnpm "$@"
          '';
          runtimeLibs = [
            pkgs.libpq
            pkgs.openssl
          ]
          ++ lib.optionals pkgs.stdenv.hostPlatform.isDarwin [ pkgs.libiconv ];
        in
        {
          default = pkgs.mkShell (
            {
              packages = [
                pkgs.nodejs_22
                pnpm
                postgres
                pkgs.libpq
                pkgs.openssl
                pkgs.pkg-config
                pkgs.python3
                pkgs.gnumake
                pkgs.git
              ]
              ++ lib.optionals pkgs.stdenv.hostPlatform.isDarwin [ pkgs.libiconv ]
              ++ lib.optionals pkgs.stdenv.hostPlatform.isLinux [ pkgs.chromium ];

              LD_LIBRARY_PATH = lib.makeLibraryPath runtimeLibs;

              shellHook = ''
                export PNPM_HOME="$PWD/.pnpm-home"
                export PATH="$PNPM_HOME:$PATH"
                export npm_config_python="${pkgs.python3}/bin/python3"

                export PGDATA="$PWD/.nix-postgres"
                export PGHOST="$PGDATA/tmp"
                export PGPORT="''${PGPORT:-5432}"

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
            // lib.optionalAttrs pkgs.stdenv.hostPlatform.isDarwin {
              DYLD_LIBRARY_PATH = lib.makeLibraryPath runtimeLibs;
            }
            // lib.optionalAttrs pkgs.stdenv.hostPlatform.isLinux {
              PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
            }
          );
        }
      );
    };
}
