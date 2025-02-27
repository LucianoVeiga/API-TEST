export default function AddTeamForm({
  classified,
  setId,
  setLogo,
  postTeamToAPI,
  setName,
  setColor,
  setNumber,
  setClassified,
}) {
  return (
    <div className="box" style={{ minHeight: "auto" }}>
      <form
        style={{ display: "flex", flexDirection: "row" }}
        onSubmit={postTeamToAPI}
      >
        <div>
          <button
            className="button"
            type="button"
            onClick={() => document.getElementById("logoUpload").click()}
          >
            Upload Logo
          </button>
        </div>
        <input
          id="logoUpload"
          type="file"
          size="60"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const logoPreview = document.getElementById("logoPreview");
                logoPreview.style = { display: "inline-block" };
                logoPreview.src = e.target.result;
              };
              reader.readAsDataURL(e.target.files[0]);
            }
            setLogo(e.target.files[0]);
          }}
          required
        />
        <img
          height={70}
          style={{ display: "none" }}
          id="logoPreview"
          alt="logoPreview"
        ></img>
        <input
          id="name"
          className="input"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          id="color"
          className="input"
          placeholder="Color"
          onChange={(e) => setColor(e.target.value)}
          required
        />
        <input
          id="number"
          className="input"
          type="number"
          placeholder="Number"
          onChange={(e) => setNumber(parseInt(e.target.value))}
          required
        />
        <div>
          <button
            className="button"
            type="button"
            onClick={() => {
              setClassified(!classified);
            }}
          >
            {classified ? "Classified" : "Not classified"}
          </button>
        </div>
        <input
          id="id"
          className="input"
          placeholder="Id"
          onChange={(e) => setId(e.target.value)}
          required
        />
        <button className="button">Add</button>
      </form>
    </div>
  );
}
