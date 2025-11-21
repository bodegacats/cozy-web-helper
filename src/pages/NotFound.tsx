import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Build Me a Simple Site</title>
        <meta name="title" content="404 - Page Not Found | Build Me a Simple Site" />
        <meta name="description" content="The page you are looking for could not be found. Please check the URL or return to our homepage." />
        <meta name="robots" content="noindex, nofollow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Build Me a Simple Site" />
        <meta property="og:title" content="404 - Page Not Found | Build Me a Simple Site" />
        <meta property="og:description" content="The page you are looking for could not be found." />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="404 - Page Not Found | Build Me a Simple Site" />
        <meta name="twitter:description" content="The page you are looking for could not be found." />
      </Helmet>

      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <a href="/" className="text-primary underline hover:text-primary/90">
            Return to Home
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;
