import CompanyCard from "../CompanyCard";

export default function CompanyCardExample() {
  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <CompanyCard
        id="1"
        name="Derba Midroc Cement"
        description="Leading cement manufacturer in Ethiopia with state-of-the-art production facilities"
        location="Addis Ababa, Ethiopia"
        category="Cement"
        productCount={12}
        onClick={() => console.log("Company clicked")}
      />
      <CompanyCard
        id="2"
        name="Ethiopian Steel Corporation"
        description="Specialized in high-quality steel products for construction and infrastructure"
        location="Dire Dawa, Ethiopia"
        category="Steel"
        productCount={24}
        onClick={() => console.log("Company clicked")}
      />
    </div>
  );
}
