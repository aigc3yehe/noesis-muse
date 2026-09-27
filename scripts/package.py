"""Build a shareable archive from a reviewed, explicit file allowlist."""
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

root = Path(__file__).resolve().parent.parent
subprocess.run(['node', str(root / 'scripts/verify.mjs')], cwd=root, check=True)
files = json.loads((root / 'release-files.json').read_text())
release = root / 'release'
release.mkdir(exist_ok=True)
archive = release / 'noesis-muse-0.1.0.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as output:
    for name in sorted(files):
        path = root / name
        if path.is_symlink() or not path.is_file():
            raise RuntimeError('Invalid release file: ' + name)
        output.writestr('noesis-muse/' + name, path.read_bytes())
with zipfile.ZipFile(archive) as output:
    if output.testzip() is not None or len(output.namelist()) != len(files):
        raise RuntimeError('Archive integrity failed')
    for name in files:
        if output.read('noesis-muse/' + name) != (root / name).read_bytes():
            raise RuntimeError('Archive content mismatch')
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
(release / (archive.name + '.sha256')).write_text(digest + '  ' + archive.name + '\n')
print('Created ' + archive.name + ' (' + str(len(files)) + ' verified files)')
